from django.db import IntegrityError

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from treeckle.common.exceptions import Conflict, BadRequest
from users.permission_middlewares import check_access
from users.models import Role, User
from .serializers import GetVenueSerializer, VenueSerializer
from .models import Venue, VenueCategory
from .middlewares import check_requester_venue_same_organization
from .logic import (
    venue_to_json,
    get_venue_categories,
    get_venues,
    get_requested_venues,
    create_venue,
    update_venue,
    delete_unused_venue_categories,
)

# Create your views here.


class VenueCategoriesView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        same_organization_venue_categories = get_venue_categories(
            organization=requester.organization
        )

        data = [
            venue_category.name for venue_category in same_organization_venue_categories
        ]

        return Response(data, status=status.HTTP_200_OK)


class VenuesView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    def get(self, request, requester: User):
        serializer = GetVenueSerializer(data=request.query_params.dict())

        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        venues = get_requested_venues(
            organization=requester.organization,
            category=validated_data.get("category", None),
        )

        full_details = validated_data.get("full_details", True)

        if full_details:
            venues = venues.select_related("category")

        data = [venue_to_json(venue, full_details=full_details) for venue in venues]

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    def post(self, request, requester: User):
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
        except IntegrityError as e:
            raise Conflict(detail="Venue already exists.")
        except Exception as e:
            raise BadRequest(e)

        data = venue_to_json(new_venue)

        return Response(data, status=status.HTTP_201_CREATED)


class SingleVenueView(APIView):
    @check_access(Role.RESIDENT, Role.ORGANIZER, Role.ADMIN)
    @check_requester_venue_same_organization
    def get(self, request, requester: User, venue: Venue):
        data = venue_to_json(venue)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_venue_same_organization
    def put(self, request, requester: User, venue: Venue):
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

        except IntegrityError as e:
            raise Conflict(detail="Venue already exists.")
        except Exception as e:
            raise BadRequest(e)

        data = venue_to_json(updated_venue)

        return Response(data, status=status.HTTP_200_OK)

    @check_access(Role.ADMIN)
    @check_requester_venue_same_organization
    def delete(self, request, requester: User, venue: Venue):
        venue.delete()
        delete_unused_venue_categories(organization=venue.organization)

        return Response(status=status.HTTP_204_NO_CONTENT)
