from redis import Redis
from rq import Worker
from config import REDIS_URL, TASK_QUEUE_NAME

if __name__ == "__main__":
    redis = Redis.from_url(REDIS_URL)
    worker = Worker([TASK_QUEUE_NAME], connection=redis)
    worker.work(with_scheduler=True)
