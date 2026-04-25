from django.urls import path
from .views import NormalUserViewSet, MedicalPersonnelViewSet

urlpatterns = [

    # ── Step 1: Submit basic info → login_id emailed ────────────────────────
    path('user/register/',
         NormalUserViewSet.as_view({'post': 'register'}),
         name='user-register'),

    # ── Step 2: Submit login_id + password → account activated ──────────────
    path('user/activate/',
         NormalUserViewSet.as_view({'post': 'activate'}),
         name='user-activate'),

    # ── Login (works for both user types) ───────────────────────────────────
    path('user/login/',
         NormalUserViewSet.as_view({'post': 'login'}),
         name='user-login'),

    # ── Profile ─────────────────────────────────────────────────────────────
    path('user/profile/',
         NormalUserViewSet.as_view({'get': 'profile'}),
         name='user-profile'),

    path('user/update-profile/',
         NormalUserViewSet.as_view({'patch': 'update_profile'}),
         name='user-update-profile'),

    path('user/change-password/',
         NormalUserViewSet.as_view({'post': 'change_password'}),
         name='user-change-password'),

    path('user/deactivate/',
         NormalUserViewSet.as_view({'post': 'deactivate_account'}),
         name='user-deactivate'),

    # ── Medical Personnel (superadmin only) ──────────────────────────────────
    path('medical/create/',
         MedicalPersonnelViewSet.as_view({'post': 'create_personnel'}),
         name='medical-create'),

    path('medical/list/',
         MedicalPersonnelViewSet.as_view({'get': 'list_personnel'}),
         name='medical-list'),

    path('medical/retrieve/',
         MedicalPersonnelViewSet.as_view({'get': 'retrieve_personnel'}),
         name='medical-retrieve'),

    path('medical/update/',
         MedicalPersonnelViewSet.as_view({'patch': 'update_personnel'}),
         name='medical-update'),
]