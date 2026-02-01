from django.contrib import admin
from django.urls import path, re_path
from web.views import ReactAppView, LoginView, RegisterView, LogoutView, UserView, GetCSRFToken, RequestBloodView, GetRequestsView, AllocateDonorView, LogDonationView, GetPendingDonationsView, VerifyDonationView, DonorHistoryView

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^api/login/?$', LoginView.as_view()),
    re_path(r'^api/register/?$', RegisterView.as_view()),
    re_path(r'^api/logout/?$', LogoutView.as_view()),
    re_path(r'^api/user/?$', UserView.as_view()),
    re_path(r'^api/csrf/?$', GetCSRFToken.as_view()),
    re_path(r'^api/request-blood/?$', RequestBloodView.as_view()),
    re_path(r'^api/all-requests/?$', GetRequestsView.as_view()),
    re_path(r'^api/allocate-donor/?$', AllocateDonorView.as_view()),
    re_path(r'^api/donate/?$', LogDonationView.as_view()),
    re_path(r'^api/admin/donations/pending/?$', GetPendingDonationsView.as_view()),
    re_path(r'^api/admin/donations/verify/?$', VerifyDonationView.as_view()),
    re_path(r'^api/my-donations/?$', DonorHistoryView.as_view()),
    re_path(r'^.*$', ReactAppView.as_view()),
]
