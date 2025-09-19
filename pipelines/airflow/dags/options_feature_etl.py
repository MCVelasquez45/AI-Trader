from __future__ import annotations

from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.empty import EmptyOperator
from airflow.operators.python import PythonOperator


def compute_iv_rank(**context):
    # TODO: Implement TimescaleDB query + compute logic.
    print("Computing IV rank snapshots")


def compute_liquidity_scores(**context):
    print("Calculating liquidity scores from option chain history")


def build_feature_views(**context):
    print("Materializing feature store views via Feast")


def notify_complete(**context):
    print("ETL pipeline finished successfully")


default_args = {
    "owner": "ai-trader",
    "depends_on_past": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

dag = DAG(
    dag_id="options_feature_etl",
    default_args=default_args,
    description="Nightly pipeline computing analytics features for the recommender",
    schedule="0 2 * * *",
    start_date=datetime(2025, 1, 1),
    catchup=False,
    tags=["features", "options"],
)

start = EmptyOperator(task_id="start", dag=dag)
iv_rank = PythonOperator(task_id="iv_rank", python_callable=compute_iv_rank, dag=dag)
liquidity = PythonOperator(task_id="liquidity", python_callable=compute_liquidity_scores, dag=dag)
feature_views = PythonOperator(task_id="feature_views", python_callable=build_feature_views, dag=dag)
end = PythonOperator(task_id="end", python_callable=notify_complete, dag=dag)

start >> iv_rank >> liquidity >> feature_views >> end
