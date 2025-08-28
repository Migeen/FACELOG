from fastapi import APIRouter

router = APIRouter()

# Defer imports to avoid circular dependency
def _import_routers():
    from . import employees, attendance, verify, auth
    return employees, attendance, verify, auth

# Include routers after imports
employees_mod, attendance_mod, verify_mod, auth_mod = _import_routers()
router.include_router(auth_mod.router, prefix="/auth", tags=["auth"])
router.include_router(employees_mod.router, prefix="/employees", tags=["employees"])
router.include_router(attendance_mod.router, prefix="/attendance", tags=["attendance"])
router.include_router(verify_mod.router, prefix="/verify", tags=["verify"])

@router.get("/status")
def status():
    return {"message": "API v1 is running"}