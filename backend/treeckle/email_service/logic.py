import os
from typing import Iterable
from datetime import timedelta


from django.core.mail import get_connection, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from treeckle.common.constants import DATE_TIME_FORMAT
from organizations.models import Organization
from users.models import UserInvite
from bookings.models import Booking, BookingStatus

HOST = os.getenv("HOST")


def send_user_invite_emails(user_invites: Iterable[UserInvite]) -> None:
    if not user_invites:
        return

    emails = []

    for user_invite in user_invites:
        organization_name = user_invite.organization.name
        recipient_email = user_invite.email

        subject = f"Account creation for Treeckle ({organization_name})"
        html_message = render_to_string(
            "user_invite_email_template.html",
            context={
                "organization": organization_name,
                "email": recipient_email,
                "host": HOST,
            },
        )
        plain_message = strip_tags(html_message)

        email = EmailMultiAlternatives(
            subject=subject, body=plain_message, to=[recipient_email]
        )
        email.attach_alternative(html_message, "text/html")

        emails.append(email)

    connection = get_connection(fail_silently=True)
    connection.send_messages(emails)


def send_created_booking_emails(
    bookings: Iterable[Booking], organization: Organization
) -> None:
    if not bookings:
        return

    booking = bookings[0]
    booker_name = booking.booker.name
    booker_email = booking.booker.email
    venue_name = booking.venue.name
    created_at = (booking.created_at + timedelta(hours=8)).strftime(DATE_TIME_FORMAT)
    booking_title = booking.title
    status = booking.status

    time_slots = []
    for booking in bookings:
        start = booking.start_date_time + timedelta(hours=8)
        end = booking.end_date_time + timedelta(hours=8)

        time_slots.append(
            f"{start.strftime(DATE_TIME_FORMAT)} - {end.strftime(DATE_TIME_FORMAT)}"
        )

    html_message = render_to_string(
        "created_booking_email_template.html",
        context={
            "name": booker_name,
            "email": booker_email,
            "venue": venue_name,
            "created_at": created_at,
            "booking_title": booking_title,
            "time_slots": time_slots,
            "status": status,
        },
    )
    plain_message = strip_tags(html_message)

    subject = f"[{venue_name}] Your booking request has been created"
    cc_emails = [
        # listener.email
        # for listener in get_organization_listeners(organization=organization)
    ]

    email = EmailMultiAlternatives(
        subject=subject, body=plain_message, to=[booker_email], cc=cc_emails
    )
    email.attach_alternative(html_message, "text/html")

    connection = get_connection(fail_silently=True)
    connection.send_messages([email])


def send_updated_booking_emails(
    bookings: Iterable[Booking],
    id_to_previous_booking_status_mapping: dict[int:BookingStatus],
    organization=Organization,
) -> None:
    if not bookings:
        return

    cc_emails = [
        # listener.email
        # for listener in get_organization_listeners(organization=organization)
    ]

    emails = []

    for booking in bookings:
        booker_name = booking.booker.name
        booker_email = booking.booker.email
        venue_name = booking.venue.name
        created_at = (booking.created_at + timedelta(hours=8)).strftime(
            DATE_TIME_FORMAT
        )
        time_slot = f"{(booking.start_date_time + timedelta(hours=8)).strftime(DATE_TIME_FORMAT)} - {(booking.end_date_time + timedelta(hours=8)).strftime(DATE_TIME_FORMAT)}"
        booking_title = booking.title
        previous_status = id_to_previous_booking_status_mapping[booking.id]
        new_status = booking.status

        description = f"Your booking request has been {new_status.lower() if new_status != BookingStatus.PENDING else 'revoked'}"

        html_message = render_to_string(
            "updated_booking_status_email_template.html",
            context={
                "description": description,
                "name": booker_name,
                "email": booker_email,
                "venue": venue_name,
                "created_at": created_at,
                "booking_title": booking_title,
                "time_slot": time_slot,
                "previous_status": previous_status,
                "new_status": new_status,
            },
        )
        plain_message = strip_tags(html_message)

        subject = f"[{venue_name}] {description}"

        email = EmailMultiAlternatives(
            subject=subject, body=plain_message, to=[booker_email], cc=cc_emails
        )
        email.attach_alternative(html_message, "text/html")

        emails.append(email)

    connection = get_connection(fail_silently=True)
    connection.send_messages(emails)
