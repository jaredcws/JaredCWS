from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger


class AppScheduler:
    def __init__(self) -> None:
        self.scheduler = BackgroundScheduler()
        self.job_id = "poll_job"

    def start(self, func, interval: str, daily_time: str, timezone: str) -> None:
        if self.scheduler.running:
            self.scheduler.remove_all_jobs()
        hh, mm = [int(x) for x in daily_time.split(":")]

        if interval == "15m":
            trigger = IntervalTrigger(minutes=15, timezone=timezone)
        elif interval == "hourly":
            trigger = IntervalTrigger(hours=1, timezone=timezone)
        elif interval == "daily":
            trigger = CronTrigger(hour=hh, minute=mm, timezone=timezone)
        elif interval == "weekly":
            trigger = CronTrigger(day_of_week="mon", hour=hh, minute=mm, timezone=timezone)
        else:
            trigger = IntervalTrigger(hours=1, timezone=timezone)

        self.scheduler.add_job(func, trigger=trigger, id=self.job_id, replace_existing=True)
        if not self.scheduler.running:
            self.scheduler.start()

    def stop(self) -> None:
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
