from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.future import select
from sqlalchemy import func, and_, case
from typing import List, Optional, Dict, Any
from app.models.attendance import Attendance  # Assuming you have an Attendance model
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.reports import Report
from app.schemas.reports import ReportCreate, ReportResponse
from datetime import datetime, timezone, date , timedelta , time

router = APIRouter(tags=["Reports"])

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Convert minutes to hours
        total_hours = report.total_hours_today / 60.0
        
        # Convert timezone-aware datetimes to timezone-naive (UTC)
        last_checkin_naive = report.last_checkin.replace(tzinfo=None) if report.last_checkin.tzinfo else report.last_checkin
        last_checkout_naive = report.last_checkout.replace(tzinfo=None) if report.last_checkout.tzinfo else report.last_checkout
        
        # Check if report for the same employee/date exists
        result = await db.execute(
            select(Report).filter(
                Report.employee_id == report.employee_id,
                Report.date == report.date
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            # Update existing report
            existing.last_checkin = last_checkin_naive
            existing.last_checkout = last_checkout_naive
            existing.total_hours_today = total_hours
            existing.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            await db.commit()
            await db.refresh(existing)
            return existing

        # Create new report with timezone-naive datetimes
        report_data = report.dict()
        report_data["total_hours_today"] = total_hours
        report_data["last_checkin"] = last_checkin_naive
        report_data["last_checkout"] = last_checkout_naive
        report_data["created_at"] = datetime.now(timezone.utc).replace(tzinfo=None)
        report_data["updated_at"] = datetime.now(timezone.utc).replace(tzinfo=None)
        
        new_report = Report(**report_data)
        db.add(new_report)
        await db.commit()
        await db.refresh(new_report)
        return new_report
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating report: {str(e)}")
    

@router.get("/employee/{employee_id}/monthly-overview")
async def get_monthly_overview(
    employee_id: int,
    year: int = Query(..., description="Year (e.g., 2024)"),
    month: int = Query(..., description="Month (1-12)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get monthly overview statistics for the attendance dashboard.
    Returns data for the cards: Present Days, Late Days, Total Hours, etc.
    """
    try:
        # Calculate date range for the month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Get all reports for the month
        result = await db.execute(
            select(Report)
            .filter(
                Report.employee_id == employee_id,
                Report.date.between(start_date, end_date)
            )
        )
        reports = result.scalars().all()
        
        # Calculate statistics
        present_days = len(reports)
        
        # Calculate late days (assuming late if check-in after 9:00 AM)
        late_days = 0
        total_hours = 0
        checkin_times = []
        checkout_times = []
        
        for report in reports:
            total_hours += report.total_hours_today
            
            if report.last_checkin:
                checkin_time = report.last_checkin.time()
                checkin_times.append(checkin_time)
                # Consider late if check-in after 9:00 AM
                if checkin_time.hour >= 9 and checkin_time.minute > 0:
                    late_days += 1
            
            if report.last_checkout:
                checkout_times.append(report.last_checkout.time())
        
        # Calculate averages
        avg_checkin = calculate_average_time(checkin_times) if checkin_times else None
        avg_checkout = calculate_average_time(checkout_times) if checkout_times else None
        
        # Calculate attendance rate (assuming 22 working days per month)
        working_days_in_month = 22  # You might want to calculate this dynamically
        attendance_rate = (present_days / working_days_in_month) * 100 if working_days_in_month > 0 else 0
        
        return {
            "present_days": present_days,
            "late_days": late_days,
            "total_hours": round(total_hours, 2),
            "total_hours_formatted": format_hours_minutes(total_hours),
            "attendance_rate": round(attendance_rate, 1),
            "average_checkin": avg_checkin.strftime("%I:%M %p").replace("AM", "AM").replace("PM", "PM") if avg_checkin else "N/A",
            "average_checkout": avg_checkout.strftime("%I:%M %p").replace("AM", "AM").replace("PM", "PM") if avg_checkout else "N/A",
            "month": datetime(year, month, 1).strftime("%B %Y")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating monthly overview: {str(e)}")

@router.get("/employee/{employee_id}/daily-records")
async def get_daily_records(
    employee_id: int,
    year: int = Query(..., description="Year (e.g., 2024)"),
    month: int = Query(..., description="Month (1-12)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get daily attendance records for the monthly view.
    Returns formatted data for the daily records list.
    """
    try:
        # Calculate date range for the month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Get all reports for the month ordered by date
        result = await db.execute(
            select(Report)
            .filter(
                Report.employee_id == employee_id,
                Report.date.between(start_date, end_date)
            )
            .order_by(Report.date.desc())
        )
        reports = result.scalars().all()
        
        daily_records = []
        
        for report in reports:
            # Determine status based on hours and check-in time
            status = "Present"
            notes = ""
            
            if report.total_hours_today < 8:  # Assuming 8 hours is a full day
                status = "Partial"
                notes = "Short hours"
            
            # Check if late (after 9:00 AM)
            if report.last_checkin and report.last_checkin.time().hour >= 9 and report.last_checkin.time().minute > 0:
                status = "Late"
                notes = "Late arrival"
            
            # Format the record
            record = {
                "date": report.date.strftime("%a, %b %d"),  # "Mon, Jan 15"
                "hours": format_hours_minutes(report.total_hours_today),  # "8h 0m"
                "time_range": format_time_range(report.last_checkin, report.last_checkout),  # "09:00 AM - 06:00 PM"
                "status": status,
                "notes": notes,
                "checkin_time": report.last_checkin.strftime("%I:%M %p").replace("AM", "AM").replace("PM", "PM") if report.last_checkin else "N/A",
                "checkout_time": report.last_checkout.strftime("%I:%M %p").replace("AM", "AM").replace("PM", "PM") if report.last_checkout else "N/A",
                "full_date": report.date.isoformat()
            }
            
            daily_records.append(record)
        
        return daily_records
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving daily records: {str(e)}")

@router.get("/employee/{employee_id}/available-months")
async def get_available_months(
    employee_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of months that have attendance data for the employee.
    Useful for the month selector dropdown.
    """
    try:
        result = await db.execute(
            select(
                func.extract('year', Report.date).label("year"),
                func.extract('month', Report.date).label("month"),
                func.count(Report.id).label("record_count")
            )
            .filter(Report.employee_id == employee_id)
            .group_by(func.extract('year', Report.date), func.extract('month', Report.date))
            .order_by(func.extract('year', Report.date).desc(), func.extract('month', Report.date).desc())
        )
        
        months = []
        for year, month, count in result.all():
            months.append({
                "year": int(year),
                "month": int(month),
                "month_name": datetime(int(year), int(month), 1).strftime("%B %Y"),
                "record_count": int(count)
            })
        
        return months
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving available months: {str(e)}")

# Helper functions
def format_hours_minutes(total_hours: float) -> str:
    """Convert decimal hours to 'Xh Ym' format"""
    hours = int(total_hours)
    minutes = int((total_hours - hours) * 60)
    return f"{hours}h {minutes}m"

def format_time_range(checkin: datetime, checkout: datetime) -> str:
    """Format time range as 'HH:MM AM/PM - HH:MM AM/PM'"""
    if not checkin or not checkout:
        return "N/A - N/A"
    
    checkin_str = checkin.strftime("%I:%M %p").replace("AM", "AM").replace("PM", "PM")
    checkout_str = checkout.strftime("%I:%M %p").replace("AM", "AM").replace("PM", "PM")
    return f"{checkin_str} - {checkout_str}"

def calculate_average_time(times: List[time]) -> time:
    """Calculate average time from a list of time objects"""
    if not times:
        return None
    
    total_seconds = sum(t.hour * 3600 + t.minute * 60 + t.second for t in times)
    avg_seconds = total_seconds // len(times)
    
    hours = avg_seconds // 3600
    minutes = (avg_seconds % 3600) // 60
    seconds = avg_seconds % 60
    
    return time(hour=hours, minute=minutes, second=seconds)