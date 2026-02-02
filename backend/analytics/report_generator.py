"""
Report Generator - Create static visualizations and PDF reports.
"""
import io
import base64
import logging
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from models import Subscription

logger = logging.getLogger(__name__)

class ReportGenerator:
    """
    Generate static analysis reports with matplotlib and seaborn visualizations.
    """
    
    def __init__(self, subscriptions: List[Subscription]):
        if subscriptions is None:
             raise ValueError("Subscriptions cannot be None")
             
        self.subscriptions = subscriptions
        # Modules placeholder for lazy loading
        self._plt = None
        self._sns = None
        self._pd = None
        self._np = None
    
    def _ensure_plotting_libs(self):
        """Lazy load heavy plotting libraries (matplotlib, seaborn, pandas)"""
        if self._plt is None:
            try:
                import matplotlib
                matplotlib.use('Agg') # Non-interactive backend
                import matplotlib.pyplot as plt
                import seaborn as sns
                import pandas as pd
                import numpy as np
                
                self._plt = plt
                self._sns = sns
                self._pd = pd
                self._np = np
                
                self._setup_style()
                logger.info("Plotting libraries loaded successfully")
            except ImportError as e:
                logger.critical(f"Failed to load plotting libraries: {e}")
                raise
    
    def _setup_style(self):
        """Configure matplotlib and seaborn styling"""
        self._sns.set_style("darkgrid")
        self._sns.set_palette("husl")
        
        rc_params = {
            'figure.figsize': (10, 6),
            'figure.dpi': 100,
            'savefig.dpi': 300,
            'savefig.bbox': 'tight',
            'font.size': 10,
            'axes.titlesize': 14,
            'axes.labelsize': 12
        }
        self._plt.rcParams.update(rc_params)

    def _get_active_subscriptions(self) -> List[Subscription]:
        """Helper to get only active subscriptions (DRY)"""
        return [sub for sub in self.subscriptions if sub.is_active]

    def _fig_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string safely"""
        try:
            buffer = io.BytesIO()
            fig.savefig(buffer, format='png', bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.read()).decode()
            self._plt.close(fig)
            return f"data:image/png;base64,{image_base64}"
        except Exception as e:
            logger.error(f"Error converting figure to base64: {e}")
            if fig:
                self._plt.close(fig)
            return ""

    def create_category_distribution_plot(self, save_path: Optional[str] = None) -> str:
        """Create a bar plot showing subscription distribution by category"""
        try:
            self._ensure_plotting_libs()
            
            active_subs = self._get_active_subscriptions()
            if not active_subs:
                return ""
            
            categories = [sub.category for sub in active_subs]
            category_counts = self._pd.Series(categories).value_counts()
            
            fig, ax = self._plt.subplots(figsize=(10, 6))
            
            self._sns.barplot(
                x=category_counts.values,
                y=category_counts.index,
                palette="viridis",
                ax=ax
            )
            
            ax.set_xlabel('Number of Subscriptions', fontweight='bold')
            ax.set_ylabel('Category', fontweight='bold')
            ax.set_title('Subscription Distribution by Category', fontweight='bold', fontsize=16)
            
            for i, v in enumerate(category_counts.values):
                ax.text(v + 0.1, i, str(v), va='center')
            
            self._plt.tight_layout()
            
            if save_path:
                self._plt.savefig(save_path)
                self._plt.close()
                return save_path
            
            return self._fig_to_base64(fig)
            
        except Exception as e:
            logger.error(f"Error generating category plot: {e}", exc_info=True)
            return ""

    def create_cost_analysis_plot(self, save_path: Optional[str] = None) -> str:
        """Create comprehensive cost analysis visualization"""
        try:
            self._ensure_plotting_libs()
            
            active_subs = self._get_active_subscriptions()
            if not active_subs:
                return ""
            
            costs = [sub.cost for sub in active_subs]
            categories = [sub.category for sub in active_subs]
            
            df = self._pd.DataFrame({'cost': costs, 'category': categories})
            
            fig, axes = self._plt.subplots(2, 2, figsize=(14, 10))
            fig.suptitle('Comprehensive Cost Analysis', fontsize=18, fontweight='bold')
            
            # 1. Cost Distribution Histogram
            axes[0, 0].hist(costs, bins=15, color='skyblue', edgecolor='black', alpha=0.7)
            axes[0, 0].set_title('Cost Distribution')
            axes[0, 0].axvline(self._np.mean(costs), color='red', linestyle='--', label='Mean')
            axes[0, 0].legend()
            
            # 2. Box Plot
            self._sns.boxplot(data=df, y='category', x='cost', palette='Set2', ax=axes[0, 1])
            axes[0, 1].set_title('Cost Distribution by Category')
            
            # 3. Pie Chart
            category_costs = df.groupby('category')['cost'].sum()
            axes[1, 0].pie(
                category_costs.values, labels=category_costs.index, autopct='%1.1f%%',
                startangle=90, colors=self._sns.color_palette('pastel')
            )
            axes[1, 0].set_title('Cost Share by Category')
            
            # 4. Violin Plot
            self._sns.violinplot(data=df, y='category', x='cost', palette='muted', ax=axes[1, 1])
            axes[1, 1].set_title('Cost Density by Category')
            
            self._plt.tight_layout()
            
            if save_path:
                self._plt.savefig(save_path)
                self._plt.close()
                return save_path
                
            return self._fig_to_base64(fig)

        except Exception as e:
            logger.error(f"Error generating cost plot: {e}", exc_info=True)
            return ""

    def create_statistical_summary_plot(self, save_path: Optional[str] = None) -> str:
        """Create a statistical summary visualization"""
        try:
            self._ensure_plotting_libs()
            
            active_subs = self._get_active_subscriptions()
            if not active_subs:
                return ""
            
            costs = self._np.array([sub.cost for sub in active_subs])
            
            stats = {
                'Mean': self._np.mean(costs),
                'Median': self._np.median(costs),
                'Std Dev': self._np.std(costs),
                'Min': self._np.min(costs),
                'Max': self._np.max(costs),
                'Total': self._np.sum(costs)
            }
            
            fig, ax = self._plt.subplots(figsize=(10, 6))
            colors = self._sns.color_palette('coolwarm', len(stats))
            bars = ax.barh(list(stats.keys()), list(stats.values()), color=colors)
            
            ax.set_title('Statistical Summary of Subscription Costs', fontweight='bold')
            
            for i, (bar, value) in enumerate(zip(bars, stats.values())):
                ax.text(value, i, f'${value:.2f}', va='center')
            
            self._plt.tight_layout()
            
            if save_path:
                self._plt.savefig(save_path)
                self._plt.close()
                return save_path
                
            return self._fig_to_base64(fig)

        except Exception as e:
            logger.error(f"Error generating stats plot: {e}", exc_info=True)
            return ""

    def create_correlation_heatmap(self, save_path: Optional[str] = None) -> str:
        """Create a correlation heatmap for numerical features"""
        try:
            self._ensure_plotting_libs()
            
            active_subs = self._get_active_subscriptions()
            if len(active_subs) < 3:
                return ""
            
            data = []
            for sub in active_subs:
                data.append({
                    'cost': float(sub.cost),
                    'annual_cost': float(sub.calculate_annual_cost()),
                    'days_active': float((datetime.now() - sub.start_date).days),
                    'is_monthly': 1.0 if sub.get_billing_cycle() == 'monthly' else 0.0
                })
            
            df = self._pd.DataFrame(data)
            
            # Remove constant columns
            df = df.loc[:, df.std() > 0]
            
            if len(df.columns) < 2:
                return ""
            
            corr_matrix = df.corr()
            if corr_matrix.isna().any().any():
                return ""
            
            fig, ax = self._plt.subplots(figsize=(8, 6))
            self._sns.heatmap(
                corr_matrix, annot=True, fmt='.2f', cmap='coolwarm',
                center=0, square=True, linewidths=1, ax=ax, vmin=-1, vmax=1
            )
            ax.set_title('Feature Correlation Heatmap', fontweight='bold')
            self._plt.tight_layout()
            
            if save_path:
                self._plt.savefig(save_path)
                self._plt.close()
                return save_path
                
            return self._fig_to_base64(fig)

        except Exception as e:
            logger.error(f"Error generating heatmap: {e}", exc_info=True)
            return ""

    def generate_full_report(self, output_dir: str = './reports') -> Dict[str, str]:
        """Generate all visualizations and save to directory"""
        try:
            import os
            os.makedirs(output_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            return {
                'category_distribution': self.create_category_distribution_plot(f'{output_dir}/category_dist_{timestamp}.png'),
                'cost_analysis': self.create_cost_analysis_plot(f'{output_dir}/cost_analysis_{timestamp}.png'),
                'statistical_summary': self.create_statistical_summary_plot(f'{output_dir}/stats_summary_{timestamp}.png'),
                'correlation_heatmap': self.create_correlation_heatmap(f'{output_dir}/correlation_{timestamp}.png')
            }
        except Exception as e:
            logger.error(f"Error generating full report: {e}", exc_info=True)
            return {}
