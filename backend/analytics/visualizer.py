"""
Visualizer - Generate charts and visualizations using Matplotlib and Plotly
"""
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import plotly.express as px
from typing import List, Dict
import io
import base64
from models import Subscription


class DataVisualizer:
    """
    Create visualizations for subscription data
    Supports both Matplotlib (static) and Plotly (interactive)
    """
    
    def __init__(self, subscriptions: List[Subscription]):
        self.subscriptions = subscriptions
        # Set style for matplotlib
        plt.style.use('dark_background')
    
    def create_category_pie_chart(self, cost_by_category: Dict[str, float]) -> str:
        """
        Create pie chart of costs by category using Plotly
        Returns: JSON string for Plotly chart
        """
        if not cost_by_category:
            return "{}"
        
        labels = list(cost_by_category.keys())
        values = list(cost_by_category.values())
        
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=0.4,  # Donut chart
            marker=dict(
                colors=px.colors.qualitative.Set3,
                line=dict(color='#1e293b', width=2)
            ),
            textinfo='label+percent',
            textfont=dict(size=14),
            hovertemplate='<b>%{label}</b><br>$%{value:.2f}/month<br>%{percent}<extra></extra>'
        )])
        
        fig.update_layout(
            title='Monthly Cost by Category',
            title_font=dict(size=20, color='#f1f5f9'),
            paper_bgcolor='#0f172a',
            plot_bgcolor='#0f172a',
            font=dict(color='#f1f5f9'),
            showlegend=True,
            legend=dict(
                orientation="v",
                yanchor="middle",
                y=0.5,
                xanchor="left",
                x=1.05
            ),
            height=400
        )
        
        return fig.to_json()
    
    def create_cost_trend_chart(self, predictions: List[Dict]) -> str:
        """
        Create line chart showing cost predictions
        Returns: JSON string for Plotly chart
        """
        if not predictions:
            return "{}"
        
        months = [p['month'] for p in predictions]
        costs = [p['predicted_cost'] for p in predictions]
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=months,
            y=costs,
            mode='lines+markers',
            name='Predicted Cost',
            line=dict(color='#6366f1', width=3),
            marker=dict(size=8, color='#8b5cf6'),
            fill='tozeroy',
            fillcolor='rgba(99, 102, 241, 0.2)',
            hovertemplate='<b>%{x}</b><br>$%{y:.2f}<extra></extra>'
        ))
        
        fig.update_layout(
            title='Cost Prediction (Next 6 Months)',
            title_font=dict(size=20, color='#f1f5f9'),
            xaxis_title='Month',
            yaxis_title='Cost ($)',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#1e293b',
            font=dict(color='#f1f5f9'),
            xaxis=dict(
                gridcolor='#334155',
                showgrid=True
            ),
            yaxis=dict(
                gridcolor='#334155',
                showgrid=True
            ),
            hovermode='x unified',
            height=400
        )
        
        return fig.to_json()
    
    def create_billing_cycle_bar_chart(self, cost_by_cycle: Dict[str, float]) -> str:
        """
        Create bar chart of costs by billing cycle
        Returns: JSON string for Plotly chart
        """
        if not cost_by_cycle:
            return "{}"
        
        cycles = list(cost_by_cycle.keys())
        costs = list(cost_by_cycle.values())
        
        fig = go.Figure(data=[go.Bar(
            x=cycles,
            y=costs,
            marker=dict(
                color=costs,
                colorscale='Viridis',
                line=dict(color='#1e293b', width=2)
            ),
            text=[f'${c:.2f}' for c in costs],
            textposition='outside',
            hovertemplate='<b>%{x}</b><br>$%{y:.2f}/month<extra></extra>'
        )])
        
        fig.update_layout(
            title='Monthly Cost by Billing Cycle',
            title_font=dict(size=20, color='#f1f5f9'),
            xaxis_title='Billing Cycle',
            yaxis_title='Monthly Cost ($)',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#1e293b',
            font=dict(color='#f1f5f9'),
            xaxis=dict(gridcolor='#334155'),
            yaxis=dict(gridcolor='#334155'),
            height=400
        )
        
        return fig.to_json()
    
    def create_subscription_timeline(self, upcoming_payments: List[Dict]) -> str:
        """
        Create timeline visualization of upcoming payments
        Returns: JSON string for Plotly chart
        """
        if not upcoming_payments:
            return "{}"
        
        names = [p['name'] for p in upcoming_payments]
        dates = [p['billing_date'] for p in upcoming_payments]
        costs = [p['cost'] for p in upcoming_payments]
        days = [p['days_until'] for p in upcoming_payments]
        
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=dates,
            y=names,
            mode='markers+text',
            marker=dict(
                size=[c * 2 for c in costs],  # Size based on cost
                color=costs,
                colorscale='RdYlGn_r',
                showscale=True,
                colorbar=dict(title='Cost ($)'),
                line=dict(color='#1e293b', width=2)
            ),
            text=[f'${c:.2f}' for c in costs],
            textposition='middle right',
            hovertemplate='<b>%{y}</b><br>Date: %{x}<br>Cost: $%{marker.color:.2f}<extra></extra>'
        ))
        
        fig.update_layout(
            title='Upcoming Payments (Next 7 Days)',
            title_font=dict(size=20, color='#f1f5f9'),
            xaxis_title='Billing Date',
            yaxis_title='Subscription',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#1e293b',
            font=dict(color='#f1f5f9'),
            xaxis=dict(gridcolor='#334155'),
            yaxis=dict(gridcolor='#334155'),
            height=max(400, len(names) * 50)
        )
        
        return fig.to_json()
    
    def create_category_distribution_chart(self, distribution: Dict[str, int]) -> str:
        """
        Create horizontal bar chart of subscription count by category
        Returns: JSON string for Plotly chart
        """
        if not distribution:
            return "{}"
        
        categories = list(distribution.keys())
        counts = list(distribution.values())
        
        fig = go.Figure(data=[go.Bar(
            y=categories,
            x=counts,
            orientation='h',
            marker=dict(
                color=counts,
                colorscale='Blues',
                line=dict(color='#1e293b', width=2)
            ),
            text=counts,
            textposition='outside',
            hovertemplate='<b>%{y}</b><br>%{x} subscriptions<extra></extra>'
        )])
        
        fig.update_layout(
            title='Subscriptions by Category',
            title_font=dict(size=20, color='#f1f5f9'),
            xaxis_title='Number of Subscriptions',
            yaxis_title='Category',
            paper_bgcolor='#0f172a',
            plot_bgcolor='#1e293b',
            font=dict(color='#f1f5f9'),
            xaxis=dict(gridcolor='#334155'),
            yaxis=dict(gridcolor='#334155'),
            height=max(400, len(categories) * 50)
        )
        
        return fig.to_json()
    
    def generate_all_charts(self, analytics_data: Dict) -> Dict[str, str]:
        """
        Generate all charts from analytics data
        
        Args:
            analytics_data: Dictionary from SubscriptionAnalyzer.export_to_dict()
        
        Returns:
            Dictionary of chart_name -> JSON string
        """
        charts = {}
        
        if analytics_data.get('cost_by_category'):
            charts['category_pie'] = self.create_category_pie_chart(
                analytics_data['cost_by_category']
            )
        
        if analytics_data.get('cost_by_billing_cycle'):
            charts['billing_cycle_bar'] = self.create_billing_cycle_bar_chart(
                analytics_data['cost_by_billing_cycle']
            )
        
        if analytics_data.get('category_distribution'):
            charts['category_distribution'] = self.create_category_distribution_chart(
                analytics_data['category_distribution']
            )
        
        if analytics_data.get('upcoming_payments'):
            charts['upcoming_timeline'] = self.create_subscription_timeline(
                analytics_data['upcoming_payments']
            )
        
        return charts
