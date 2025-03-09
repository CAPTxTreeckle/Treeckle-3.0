import os
from typing import Iterable
from datetime import timedelta


from django.core.mail import get_connection, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from treeckle.common.constants import DATE_TIME_FORMAT, SUPPORT_EMAIL
from venues.logic import get_booking_notification_subscriptions
from users.models import UserInvite, User
from bookings.models import Booking, BookingStatus

HOST = os.getenv("HOST")


def send_password_reset_email(user: User, new_password: str):
    subject = "Reset your Treeckle password"
    html_message = render_to_string(
        "password_reset_email_template.html",
        context={
            "name": user.name,
            "email": user.email,
            "password": new_password,
            "host": HOST,
            "support_email": SUPPORT_EMAIL,
        },
    )
    plain_message = strip_tags(html_message)

    email = EmailMultiAlternatives(subject=subject, body=plain_message, to=[user.email])
    email.attach_alternative(html_message, "text/html")

    connection = get_connection(fail_silently=True)
    connection.send_messages([email])


def send_user_invite_emails(user_invites: Iterable[UserInvite]):
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


def send_created_booking_emails(bookings: Iterable[Booking]):
    if not bookings:
        return

    booking = bookings[0]
    booker = booking.booker
    venue = booking.venue
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
            "name": booker.name,
            "email": booker.email,
            "organization": venue.organization.name,
            "venue": venue.name,
            "created_at": created_at,
            "booking_title": booking_title,
            "time_slots": time_slots,
            "status": status,
        },
    )
    plain_message = strip_tags(html_message)

    subject = f"[{venue.name}] Your booking request has been created"
    cc_emails = [
        subscription.email
        for subscription in get_booking_notification_subscriptions(venue_id=venue.id)
        if subscription.email != booker.email
    ]

    email = EmailMultiAlternatives(
        subject=subject, body=plain_message, to=[booker.email], cc=cc_emails
    )
    email.attach_alternative(html_message, "text/html")

    connection = get_connection(fail_silently=True)
    connection.send_messages([email])


def send_updated_booking_emails(
    bookings: Iterable[Booking],
    id_to_previous_booking_status_mapping: dict[int:BookingStatus],
):
    if not bookings:
        return

    emails = []

    for booking in bookings:
        booker = booking.booker
        venue = booking.venue
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
                "name": booker.name,
                "email": booker.email,
                "organization": venue.organization.name,
                "venue": venue.name,
                "created_at": created_at,
                "booking_title": booking_title,
                "time_slot": time_slot,
                "previous_status": previous_status,
                "new_status": new_status,
            },
        )
        plain_message = strip_tags(html_message)

        subject = f"[{venue.name}] {description}"

        cc_emails = [
            subscription.email
            for subscription in get_booking_notification_subscriptions(
                venue_id=venue.id
            )
            if subscription.email != booker.email
        ]

        email = EmailMultiAlternatives(
            subject=subject, body=plain_message, to=[booker.email], cc=cc_emails
        )
        email.attach_alternative(html_message, "text/html")

        emails.append(email)

    connection = get_connection(fail_silently=True)
    connection.send_messages(emails)
