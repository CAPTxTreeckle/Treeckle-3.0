from django.db import IntegrityError

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

from treeckle.common.exceptions import Conflict
from users.permission_middlewares import check_access
from users.models import Role, User
from .serializers import (
    GetVenueSerializer,
    VenueSerializer,
    PostBookingNotificationSubscriptionSerializer,
)
from .models import Venue, BookingNotificationSubscription
from .middlewares import (
    check_requester_venue_same_organization,
    check_requester_booking_notification_subscription_same_organization,
)
from .logic import (
    venue_to_json,
    booking_notification_subscription_to_json,
    get_venue_categories,
    get_booking_notification_subscriptions,
    get_requested_venues,
    create_venue,
    update_venue,
    delete_unused_venue_categories,
)

# Create your views here.


@extend_schema_view(
    get=extend_schema(
        summary="Get Venue Categories",
        description="Retrieve all available venue categories within the user's organization. Used for filtering and categorizing venues.",
        responses={
            200: {
                "description": "List of venue categories",
                "example": [
                    "Conference Rooms",
                    "Sports Facilities", 
                    "Study Rooms",
                    "Event Halls",
                    "Outdoor Spaces"
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Insufficient permissions"}
        },
        tags=["Venues"]
    )
)
class VenueCategoriesView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all venue categories in the user's organization.
        
        Returns a list of category names that can be used for filtering venues
        or creating new venues. Only includes categories from the same organization.
        """
        same_organization_venue_categories = get_venue_categories(
            organization=requester.organization
        )

        data = [
            venue_category.name for venue_category in same_organization_venue_categories
        ]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Booking Notification Subscriptions",
        description="Retrieve all booking notification subscriptions for venues in the organization. Admin-only access.",
        responses={
            200: {
                "description": "List of all booking notification subscriptions",
                "example": [
                    {
                        "id": 1,
                        "name": "Facilities Manager",
                        "email": "facilities@university.edu",
                        "venue": {
                            "id": 5,
                            "name": "Main Conference Room",
                            "category": "Conference Rooms"
                        }
                    },
                    {
                        "id": 2,
                        "name": "Sports Coordinator",
                        "email": "sports@university.edu",
                        "venue": {
                            "id": 8,
                            "name": "Basketball Court A",
                            "category": "Sports Facilities"
                        }
                    }
                ]
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"}
        },
        tags=["Venue Notifications"]
    )
)
class BookingNotificationSubscriptionsView(APIView):
    @check_access(Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get all booking notification subscriptions in the organization.
        
        Returns subscriptions for all venues in the organization, showing
        who should be notified when bookings are made for each venue.
        """
        subscriptions = get_booking_notification_subscriptions(
            venue__organization=requester.organization
        ).select_related("venue")

        data = [
            booking_notification_subscription_to_json(subscription)
            for subscription in subscriptions
        ]

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    post=extend_schema(
        summary="Create Booking Notification Subscription",
        description="Create a new booking notification subscription for a specific venue. Admin-only access.",
        parameters=[
            OpenApiParameter(
                name="venue_id",
                description="Unique identifier of the venue to create subscription for",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        request=PostBookingNotificationSubscriptionSerializer,
        responses={
            201: {
                "description": "Subscription created successfully",
                "example": {
                    "id": 3,
                    "name": "Event Coordinator",
                    "email": "events@university.edu",
                    "venue": {
                        "id": 12,
                        "name": "Auditorium",
                        "category": "Event Halls"
                    }
                }
            },
            400: {"description": "Invalid input data"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "Venue not found"},
            409: {
                "description": "Subscription already exists",
                "example": {
                    "detail": "Booking notification subscription already exists.",
                    "code": "booking_notification_subscription_exists"
                }
            }
        },
        tags=["Venue Notifications"]
    )
)
class SingleVenueBookingNotificationSubscriptionsView(APIView):
    @check_access(Role.ADMIN)
    @check_requester_venue_same_organization
    def post(self, request, requester: User, venue: Venue):
        """
        Create a booking notification subscription for a venue.
        
        Creates a new subscription that will send notifications to the specified
        email address when bookings are made for this venue. Each email can only
        have one subscription per venue.
        """
        serializer = PostBookingNotificationSubscriptionSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            new_subscription = BookingNotificationSubscription.objects.create(
                name=validated_data.get("name", ""),
                email=validated_data.get("email", ""),
                venue=venue,
            )
        except IntegrityError:
            raise Conflict(
                detail="Booking notification subscription already exists.",
                code="booking_notification_subscription_exists",
            )

        data = booking_notification_subscription_to_json(new_subscription)

        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    delete=extend_schema(
        summary="Delete Booking Notification Subscription",
        description="Delete a specific booking notification subscription. Admin-only access.",
        parameters=[
            OpenApiParameter(
                name="subscription_id",
                description="Unique identifier of the subscription to delete",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            200: {
                "description": "Subscription deleted successfully",
                "example": {
                    "id": 3,
                    "name": "Event Coordinator",
                    "email": "events@university.edu",
                    "venue": {
                        "id": 12,
                        "name": "Auditorium",
                        "category": "Event Halls"
                    }
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "Subscription not found"}
        },
        tags=["Venue Notifications"]
    )
)
class SingleBookingNotificationSubscriptionView(APIView):
    @check_access(Role.ADMIN)
    @check_requester_booking_notification_subscription_same_organization
    def delete(
        self,
        request,
        requester: User,
        subscription: BookingNotificationSubscription,
    ):
        """
        Delete a booking notification subscription.
        
        Permanently removes the subscription, stopping future notifications
        for bookings made to the associated venue.
        """
        data = booking_notification_subscription_to_json(subscription)
        subscription.delete()

        return Response(data, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary="Get Venues",
        description="Retrieve venues in the organization with optional filtering by category and detail level. Supports both basic venue info and full details including booking forms.",
        parameters=[
            OpenApiParameter(
                name="category",
                description="Filter venues by category name",
                required=False,
                type=str,
                location=OpenApiParameter.QUERY
            ),
            OpenApiParameter(
                name="full_details",
                description="Include full venue details including form fields and contact information",
                required=False,
                type=bool,
                location=OpenApiParameter.QUERY
            )
        ],
        responses={
            200: {
                "description": "List of venues (format depends on full_details parameter)",
                "example": [
                    {
                        "id": 15,
                        "name": "Conference Room A",
                        "category": {
                            "id": 3,
                            "name": "Conference Rooms"
                        },
                        "capacity": 25,
                        "ic_name": "John Manager",
                        "ic_email": "john.manager@university.edu",
                        "ic_contact_number": "+65 9123 4567",
                        "form_field_data": [
                            {
                                "field_name": "Purpose",
                                "field_type": "text",
                                "is_required": True
                            },
                            {
                                "field_name": "Equipment Needed",
                                "field_type": "checkbox",
                                "is_required": False,
                                "options": ["Projector", "Microphone", "Whiteboard"]
                            }
                        ],
                        "organization": {
                            "id": 1,
                            "name": "University College"
                        }
                    }
                ]
            },
            400: {"description": "Invalid query parameters"},
            401: {"description": "Authentication required"}
        },
        tags=["Venues"]
    ),
    post=extend_schema(
        summary="Create New Venue",
        description="Create a new venue in the organization. Admin-only access. Venue categories will be automatically created if they don't exist.",
        request=VenueSerializer,
        responses={
            201: {
                "description": "Venue created successfully",
                "example": {
                    "id": 20,
                    "name": "Study Room B",
                    "category": {
                        "id": 5,
                        "name": "Study Rooms"
                    },
                    "capacity": 8,
                    "ic_name": "Library Staff",
                    "ic_email": "library@university.edu",
                    "ic_contact_number": "+65 9876 5432",
                    "form_field_data": [
                        {
                            "field_name": "Number of Students",
                            "field_type": "number",
                            "is_required": True
                        }
                    ],
                    "organization": {
                        "id": 1,
                        "name": "University College"
                    }
                }
            },
            400: {"description": "Invalid input data"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            409: {
                "description": "Venue already exists",
                "example": {
                    "detail": "Venue already exists.",
                    "code": "venue_exists"
                }
            }
        },
        tags=["Venues"]
    )
)
class VenuesView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        """
        Get venues in the organization.
        
        Returns venues filtered by optional category parameter. The full_details
        parameter controls whether to include complete venue information including
        form fields and contact details, or just basic venue data.
        """
        serializer = GetVenueSerializer(data=request.query_params.dict())

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        venues = get_requested_venues(
            organization=requester.organization,
            category=validated_data.get("category", None),
        )

        full_details = validated_data.get("full_details", False)

        if full_details:
            venues = venues.select_related("category", "organization")

        data = [venue_to_json(venue, full_details=full_details) for venue in venues]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def post(self, request, requester: User):
        """
        Create a new venue.
        
        Creates a venue with the provided details including custom form fields
        for booking requirements. Venue categories will be automatically created
        if they don't exist in the organization.
        """
        serializer = VenueSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            new_venue = create_venue(
                organization=requester.organization,
                venue_name=validated_data.get("name", ""),
                category_name=validated_data.get("category", ""),
                capacity=validated_data.get("capacity", None),
                ic_name=validated_data.get("ic_name", ""),
                ic_email=validated_data.get("ic_email", ""),
                ic_contact_number=validated_data.get("ic_contact_number", ""),
                form_field_data=validated_data.get("form_field_data", []),
            )
        except IntegrityError:
            raise Conflict(detail="Venue already exists.", code="venue_exists")

        data = venue_to_json(new_venue, full_details=True)

        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        summary="Get Single Venue Details",
        description="Retrieve detailed information about a specific venue including all form fields and contact information.",
        parameters=[
            OpenApiParameter(
                name="venue_id",
                description="Unique identifier of the venue",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            200: {
                "description": "Detailed venue information",
                "example": {
                    "id": 25,
                    "name": "Main Auditorium",
                    "category": {
                        "id": 8,
                        "name": "Event Halls"
                    },
                    "capacity": 500,
                    "ic_name": "Events Manager",
                    "ic_email": "events.manager@university.edu",
                    "ic_contact_number": "+65 9111 2222",
                    "form_field_data": [
                        {
                            "field_name": "Event Type",
                            "field_type": "select",
                            "is_required": True,
                            "options": ["Conference", "Seminar", "Performance", "Graduation"]
                        },
                        {
                            "field_name": "Expected Attendance",
                            "field_type": "number",
                            "is_required": True
                        },
                        {
                            "field_name": "Technical Requirements",
                            "field_type": "textarea",
                            "is_required": False
                        }
                    ],
                    "organization": {
                        "id": 1,
                        "name": "University College"
                    }
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Not authorized to view this venue"},
            404: {"description": "Venue not found"}
        },
        tags=["Venues"]
    ),
    put=extend_schema(
        summary="Update Venue",
        description="Update an existing venue's details including name, category, capacity, contact information, and form fields. Admin-only access.",
        parameters=[
            OpenApiParameter(
                name="venue_id",
                description="Unique identifier of the venue to update",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        request=VenueSerializer,
        responses={
            200: {
                "description": "Venue updated successfully",
                "example": {
                    "id": 25,
                    "name": "Updated Auditorium Name",
                    "category": {
                        "id": 8,
                        "name": "Event Halls"
                    },
                    "capacity": 450,
                    "ic_name": "New Events Manager",
                    "ic_email": "new.events@university.edu",
                    "ic_contact_number": "+65 9333 4444",
                    "form_field_data": [
                        {
                            "field_name": "Event Type",
                            "field_type": "select",
                            "is_required": True,
                            "options": ["Conference", "Seminar", "Performance", "Graduation", "Workshop"]
                        }
                    ],
                    "organization": {
                        "id": 1,
                        "name": "University College"
                    }
                }
            },
            400: {"description": "Invalid input data"},
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "Venue not found"},
            409: {
                "description": "Venue name already exists",
                "example": {
                    "detail": "Venue already exists.",
                    "code": "venue_exists"
                }
            }
        },
        tags=["Venues"]
    ),
    delete=extend_schema(
        summary="Delete Venue",
        description="Delete an existing venue. This will also remove all associated bookings and clean up unused venue categories. Admin-only access.",
        parameters=[
            OpenApiParameter(
                name="venue_id",
                description="Unique identifier of the venue to delete",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            200: {
                "description": "Venue deleted successfully",
                "example": {
                    "id": 25,
                    "name": "Deleted Venue",
                    "category": {
                        "id": 8,
                        "name": "Event Halls"
                    },
                    "capacity": 450,
                    "ic_name": "Events Manager",
                    "ic_email": "events@university.edu",
                    "ic_contact_number": "+65 9333 4444",
                    "form_field_data": [],
                    "organization": {
                        "id": 1,
                        "name": "University College"
                    }
                }
            },
            401: {"description": "Authentication required"},
            403: {"description": "Admin access required"},
            404: {"description": "Venue not found"}
        },
        tags=["Venues"]
    )
)
class SingleVenueView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_venue_same_organization
    def get(self, request, requester: User, venue: Venue):
        """
        Get detailed information about a specific venue.
        
        Returns complete venue details including form fields, contact information,
        and organization details. Accessible to all authenticated users in the
        same organization.
        """
        data = venue_to_json(venue, full_details=True)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_venue_same_organization
    def put(self, request, requester: User, venue: Venue):
        """
        Update an existing venue.
        
        Updates venue details including name, category, capacity, contact information,
        and custom form fields. Venue categories will be created if they don't exist.
        Only admins can update venues.
        """
        serializer = VenueSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            updated_venue = update_venue(
                current_venue=venue,
                venue_name=validated_data.get("name", ""),
                category_name=validated_data.get("category", ""),
                capacity=validated_data.get("capacity", None),
                ic_name=validated_data.get("ic_name", ""),
                ic_email=validated_data.get("ic_email", ""),
                ic_contact_number=validated_data.get("ic_contact_number", ""),
                form_field_data=validated_data.get("form_field_data", []),
            )

        except IntegrityError:
            raise Conflict(detail="Venue already exists.", code="venue_exists")

        data = venue_to_json(updated_venue, full_details=True)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_venue_same_organization
    def delete(self, request, requester: User, venue: Venue):
        """
        Delete an existing venue.
        
        Permanently removes the venue and all associated data including bookings
        and notification subscriptions. Also cleans up any unused venue categories
        within the organization. Only admins can delete venues.
        """
        data = venue_to_json(venue, full_details=True)
        venue.delete()
        delete_unused_venue_categories(organization=venue.organization)

        return Response(data, status=status.HTTP_200_OK)
