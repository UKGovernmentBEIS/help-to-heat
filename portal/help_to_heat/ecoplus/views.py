from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework import serializers
from rest_framework.parsers import JSONParser

from . import models


@require_http_methods(["GET"])
@login_required
def index_view(request):
    return render(
        request,
        template_name="index.html",
        context={"request": request},
    )


def unauthorised_view(request):
    return render(request, "unauthorised.html", {}, status=403)


is_supplier = user_passes_test(
    lambda user: user.is_supplier and user.supplier, login_url="unauthorised", redirect_field_name=None
)


@require_http_methods(["GET"])
@login_required
def homepage_view(request):
    if not request.user.is_supplier_admin and not request.user.is_team_leader and not request.user.is_team_member:
        return redirect("unauthorised")
    template = "unauthorised"
    data = {}
    if request.user.is_team_member:
        template = "team-member/homepage.html"
    if request.user.is_team_leader:
        supplier = request.user.supplier
        referrals = models.Referral.objects.filter(referral_download=None)
        unread_leads = len(referrals)
        archives = models.ReferralDownload.objects.all().order_by("-created_at")

        team_members = models.User.objects.filter(
            Q(supplier=supplier) & (Q(is_team_member=True) | Q(is_team_leader=True))
        )

        data = {
            "supplier": supplier,
            "unread_leads": unread_leads,
            "archives": archives,
            "team_members": team_members,
        }
        template = "team-leader/homepage.html"
    if request.user.is_supplier_admin:
        template = "supplier-admin/homepage.html"
        suppliers = models.Supplier.objects.all()

        data = {
            "suppliers": suppliers,
        }
    return render(
        request,
        template_name=template,
        context={"request": request, "data": data},
    )


class RefferalSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Referral
        fields = ["data"]


@csrf_exempt
@require_http_methods(["POST"])
def create_referral(request):
    data = JSONParser().parse(request)
    serializer = RefferalSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def lookup_epc_view(request, uprn):
    try:
        epc_rating = models.EpcRating.objects.get(uprn=uprn)
    except models.EpcRating.DoesNotExist:
        return JsonResponse({"errors": "Not found"}, status=400)
    data = {
        "uprn": epc_rating.uprn,
        "rating": epc_rating.rating,
        "date": epc_rating.date,
    }
    return JsonResponse(data, status=201)
