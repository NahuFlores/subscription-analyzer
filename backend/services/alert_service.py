"""
Alert Service - Generates smart alerts from subscription data
Stateless: alerts are computed on-demand, not persisted
"""
import logging
from datetime import datetime, timedelta
from typing import List, Dict
from models.alert import Alert
from config import AnalyticsConfig

logger = logging.getLogger(__name__)


class AlertService:
    """Generates contextual alerts from subscription analysis"""

    @staticmethod
    def generate_alerts(user_id: str) -> Dict:
        """
        Generate all alerts for a user from their subscription data.
        Returns dict with success status and alert list.
        """
        from utils import FirebaseHelper
        from models import SubscriptionFactory
        from analytics.analyzer import SubscriptionAnalyzer
        from models.user import User

        subscriptions_data = FirebaseHelper.get_user_subscriptions(user_id)

        if not subscriptions_data:
            return {'success': True, 'alerts': [], 'count': 0}

        subscriptions = [SubscriptionFactory.from_dict(s) for s in subscriptions_data]

        user_data = FirebaseHelper.get_user(user_id)
        user = (
            User.from_dict(user_data) if user_data
            else User(user_id=user_id, email='guest@example.com', name='Guest')
        )

        analyzer = SubscriptionAnalyzer(subscriptions, user)

        alerts = []
        alerts.extend(_upcoming_payment_alerts(user_id, subscriptions))
        alerts.extend(_high_cost_alerts(user_id, subscriptions))
        alerts.extend(_unused_subscription_alerts(user_id, subscriptions))
        alerts.extend(_savings_alerts(user_id, analyzer))

        alerts.sort(key=_alert_priority_key)

        return {
            'success': True,
            'alerts': [a.to_dict() for a in alerts],
            'count': len(alerts)
        }


def _alert_priority_key(alert: Alert) -> int:
    """Sort alerts: high priority first"""
    priority_order = {'high': 0, 'medium': 1, 'low': 2}
    return priority_order.get(alert.priority, 3)


def _upcoming_payment_alerts(user_id: str, subscriptions) -> List[Alert]:
    """Generate alerts for payments due within 3 days"""
    alerts = []
    today = datetime.now()
    threshold = today + timedelta(days=3)

    for sub in subscriptions:
        if not sub.is_active:
            continue

        next_billing = sub.calculate_next_billing()
        if today <= next_billing <= threshold:
            days_until = (next_billing - today).days
            day_label = "tomorrow" if days_until <= 1 else f"in {days_until} days"

            alerts.append(Alert(
                user_id=user_id,
                alert_type='upcoming_payment',
                message=f"{sub.name} (${sub.cost:.2f}) is due {day_label}",
                metadata={
                    'subscription_name': sub.name,
                    'cost': sub.cost,
                    'due_date': next_billing.isoformat(),
                    'days_until': days_until
                }
            ))

    return alerts


def _high_cost_alerts(user_id: str, subscriptions) -> List[Alert]:
    """Flag subscriptions above the high cost threshold"""
    alerts = []
    threshold = AnalyticsConfig.HIGH_COST_THRESHOLD

    for sub in subscriptions:
        if not sub.is_active:
            continue
        if sub.cost > threshold:
            alerts.append(Alert(
                user_id=user_id,
                alert_type='cost_spike',
                message=f"{sub.name} costs ${sub.cost:.2f}/mo — consider a lower tier",
                metadata={
                    'subscription_name': sub.name,
                    'cost': sub.cost,
                    'threshold': threshold
                }
            ))

    return alerts


def _unused_subscription_alerts(user_id: str, subscriptions) -> List[Alert]:
    """Flag potentially unused subscriptions (old start date + above cost threshold)"""
    alerts = []
    today = datetime.now()
    days_threshold = AnalyticsConfig.UNUSED_SUB_DAYS
    cost_threshold = AnalyticsConfig.UNUSED_SUB_COST_THRESHOLD

    for sub in subscriptions:
        if not sub.is_active:
            continue

        days_active = (today - sub.start_date).days
        if days_active > days_threshold and sub.cost >= cost_threshold:
            alerts.append(Alert(
                user_id=user_id,
                alert_type='unused_subscription',
                message=f"{sub.name} has been active for {days_active} days — still using it?",
                metadata={
                    'subscription_name': sub.name,
                    'cost': sub.cost,
                    'days_active': days_active
                }
            ))

    return alerts


def _savings_alerts(user_id: str, analyzer) -> List[Alert]:
    """Generate alerts from analyzer savings opportunities"""
    alerts = []

    try:
        savings = analyzer.calculate_potential_savings()
        opportunities = savings.get('opportunities', [])

        for opp in opportunities[:3]:
            monthly_savings = opp.get('potential_monthly_savings', 0)
            if monthly_savings < AnalyticsConfig.MINIMUM_SAVINGS_SUGGESTION:
                continue

            alerts.append(Alert(
                user_id=user_id,
                alert_type='savings_opportunity',
                message=f"Save ${monthly_savings:.2f}/mo — {opp.get('description', 'optimization available')}",
                metadata={
                    'savings': monthly_savings,
                    'type': opp.get('type', 'general'),
                    'description': opp.get('description', '')
                }
            ))
    except Exception as e:
        logger.warning(f"Failed to generate savings alerts: {e}")

    return alerts
