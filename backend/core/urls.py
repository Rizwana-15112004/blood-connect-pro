from django.contrib import admin
from django.urls import path, re_path
from web.views import (
    ReactAppView, LoginView, RegisterView, LogoutView, UserView, GetCSRFToken, 
    RequestBloodView, GetRequestsView, AllocateDonorView, LogDonationView, 
    GetPendingDonationsView, VerifyDonationView, DonorHistoryView, 
    UpdateEligibilityView, DashboardStatsView, GetDonorsView, GetInventoryView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('api/login/', LoginView.as_view()),
    path('api/register/', RegisterView.as_view()),
    path('api/logout/', LogoutView.as_view()),
    path('api/user/', UserView.as_view()),
    path('api/get-inventory/', GetInventoryView.as_view()),
    path('api/csrf/', GetCSRFToken.as_view()),
    path('api/update-eligibility/', UpdateEligibilityView.as_view()),

    # Blood Requests
    path('api/request-blood/', RequestBloodView.as_view()),
    path('api/all-requests/', GetRequestsView.as_view()),
    path('api/allocate-donor/', AllocateDonorView.as_view()),

    # Donations
    path('api/donate/', LogDonationView.as_view()),
    path('api/my-donations/', DonorHistoryView.as_view()),

    # Admin
    path('api/admin/donations/pending/', GetPendingDonationsView.as_view()),
    path('api/admin/donations/verify/', VerifyDonationView.as_view()),
    path('api/admin/stats/', DashboardStatsView.as_view()),
    path('api/admin/donors/', GetDonorsView.as_view()),

    re_path(r'^.*$', ReactAppView.as_view()),
]
