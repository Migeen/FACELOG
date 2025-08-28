from fastapi import APIRouter

router = APIRouter()

# Defer imports to avoid circular dependency
def _import_routers():
    from . import employees, attendance, auth, enroll,attendance
    return [
        (employees, "/employees", "employees"),
        (attendance, "/attendance", "attendance"),
        (auth, "/auth", "auth"),
        (enroll, "/enroll", "enroll"),
        (attendance,"/attendance","attendance")

    ]
for mod, prefix, tag in _import_routers():
    router.include_router(mod.router, prefix=prefix, tags=[tag])
    
@router.get("/status")
def status():
    return {"message": "API v1 is running"}