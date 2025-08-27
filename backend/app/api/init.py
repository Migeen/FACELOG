from fastapi import APIRouter

from .router import router
from . import auth, employees, attendance, verify

# Extend the existing router with sub-routers
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(employees.router, prefix="/employees", tags=["employees"])
router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
router.include_router(verify.router, prefix="/verify", tags=["verify"])