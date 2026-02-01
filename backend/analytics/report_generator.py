"""
Report Generator - Create static visualizations and PDF reports using Matplotlib and Seaborn
This module demonstrates Data Science visualization skills for academic/portfolio purposes
"""
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server use
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime
import io
import base64
from models import Subscription


class ReportGenerator:
    """
    Generate static analysis reports with matplotlib and seaborn visualizations.
    Used for PDF exports, offline analysis, and demonstrating Data Science skills.
    """
    
    def __init__(self, subscriptions: List[Subscription]):
        """
        Initialize report generator with subscription data
        
        Args:
            subscriptions: List of Subscription objects to analyze
        """
        self.subscriptions = subscriptions
        self._setup_style()
    
    def _setup_style(self):
        """Configure matplotlib and seaborn styling for professional reports"""
        # Set seaborn style for better aesthetics
        sns.set_style("darkgrid")
        sns.set_palette("husl")
        
        # Configure matplotlib defaults
        plt.rcParams['figure.figsize'] = (10, 6)
        plt.rcParams['figure.dpi'] = 100
        plt.rcParams['savefig.dpi'] = 300
        plt.rcParams['savefig.bbox'] = 'tight'
        plt.rcParams['font.size'] = 10
        plt.rcParams['axes.titlesize'] = 14
        plt.rcParams['axes.labelsize'] = 12
    
    def create_category_distribution_plot(self, save_path: Optional[str] = None) -> str:
        """
        Create a bar plot showing subscription distribution by category
        
        Args:
            save_path: Optional path to save the figure
        
        Returns:
            Base64 encoded image string or file path
        """
        if not self.subscriptions:
            return ""
        
        # Prepare data
        categories = [sub.category for sub in self.subscriptions if sub.is_active]
        category_counts = pd.Series(categories).value_counts()
        
        # Create figure
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Create bar plot with seaborn
        sns.barplot(
            x=category_counts.values,
            y=category_counts.index,
            palette="viridis",
            ax=ax
        )
        
        ax.set_xlabel('Number of Subscriptions', fontweight='bold')
        ax.set_ylabel('Category', fontweight='bold')
        ax.set_title('Subscription Distribution by Category', fontweight='bold', fontsize=16)
        
        # Add value labels on bars
        for i, v in enumerate(category_counts.values):
            ax.text(v + 0.1, i, str(v), va='center')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
            return save_path
        else:
            return self._fig_to_base64(fig)
    
    def create_cost_analysis_plot(self, save_path: Optional[str] = None) -> str:
        """
        Create a comprehensive cost analysis visualization with multiple subplots
        
        Args:
            save_path: Optional path to save the figure
        
        Returns:
            Base64 encoded image string or file path
        """
        if not self.subscriptions:
            return ""
        
        # Prepare data
        active_subs = [sub for sub in self.subscriptions if sub.is_active]
        costs = [sub.cost for sub in active_subs]
        categories = [sub.category for sub in active_subs]
        
        df = pd.DataFrame({
            'cost': costs,
            'category': categories
        })
        
        # Create figure with subplots
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle('Comprehensive Cost Analysis', fontsize=18, fontweight='bold')
        
        # 1. Cost Distribution Histogram
        axes[0, 0].hist(costs, bins=15, color='skyblue', edgecolor='black', alpha=0.7)
        axes[0, 0].set_xlabel('Monthly Cost ($)')
        axes[0, 0].set_ylabel('Frequency')
        axes[0, 0].set_title('Cost Distribution')
        axes[0, 0].axvline(np.mean(costs), color='red', linestyle='--', label=f'Mean: ${np.mean(costs):.2f}')
        axes[0, 0].legend()
        
        # 2. Box Plot by Category
        sns.boxplot(data=df, y='category', x='cost', palette='Set2', ax=axes[0, 1])
        axes[0, 1].set_xlabel('Monthly Cost ($)')
        axes[0, 1].set_ylabel('Category')
        axes[0, 1].set_title('Cost Distribution by Category')
        
        # 3. Category Cost Pie Chart
        category_costs = df.groupby('category')['cost'].sum()
        axes[1, 0].pie(
            category_costs.values,
            labels=category_costs.index,
            autopct='%1.1f%%',
            startangle=90,
            colors=sns.color_palette('pastel')
        )
        axes[1, 0].set_title('Cost Share by Category')
        
        # 4. Violin Plot
        sns.violinplot(data=df, y='category', x='cost', palette='muted', ax=axes[1, 1])
        axes[1, 1].set_xlabel('Monthly Cost ($)')
        axes[1, 1].set_ylabel('Category')
        axes[1, 1].set_title('Cost Density by Category')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
            return save_path
        else:
            return self._fig_to_base64(fig)
    
    def create_statistical_summary_plot(self, save_path: Optional[str] = None) -> str:
        """
        Create a statistical summary visualization with key metrics
        
        Args:
            save_path: Optional path to save the figure
        
        Returns:
            Base64 encoded image string or file path
        """
        if not self.subscriptions:
            return ""
        
        active_subs = [sub for sub in self.subscriptions if sub.is_active]
        costs = np.array([sub.cost for sub in active_subs])
        
        # Calculate statistics
        stats = {
            'Mean': np.mean(costs),
            'Median': np.median(costs),
            'Std Dev': np.std(costs),
            'Min': np.min(costs),
            'Max': np.max(costs),
            'Total': np.sum(costs)
        }
        
        # Create figure
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Create horizontal bar chart
        colors = sns.color_palette('coolwarm', len(stats))
        bars = ax.barh(list(stats.keys()), list(stats.values()), color=colors)
        
        ax.set_xlabel('Value ($)', fontweight='bold')
        ax.set_title('Statistical Summary of Subscription Costs', fontweight='bold', fontsize=16)
        
        # Add value labels
        for i, (bar, value) in enumerate(zip(bars, stats.values())):
            ax.text(value + max(stats.values()) * 0.02, i, f'${value:.2f}', va='center')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
            return save_path
        else:
            return self._fig_to_base64(fig)
    
    def create_correlation_heatmap(self, save_path: Optional[str] = None) -> str:
        """
        Create a correlation heatmap for numerical features
        
        Args:
            save_path: Optional path to save the figure
        
        Returns:
            Base64 encoded image string or file path (empty string if insufficient data)
        """
        # Need at least 3 active subscriptions for meaningful correlations
        active_subs = [sub for sub in self.subscriptions if sub.is_active]
        if len(active_subs) < 3:
            return ""
        
        try:
            # Prepare data
            data = []
            for sub in active_subs:
                data.append({
                    'cost': float(sub.cost),
                    'annual_cost': float(sub.calculate_annual_cost()),
                    'days_active': float((datetime.now() - sub.start_date).days),
                    'is_monthly': 1.0 if sub.get_billing_cycle() == 'monthly' else 0.0
                })
            
            df = pd.DataFrame(data)
            
            # Check if we have enough variance (avoid constant columns)
            if df.std().min() == 0:
                # If any column is constant, drop it
                df = df.loc[:, df.std() > 0]
            
            # Need at least 2 columns for correlation
            if len(df.columns) < 2:
                return ""
            
            # Create correlation matrix
            corr_matrix = df.corr()
            
            # Check for NaN values
            if corr_matrix.isna().any().any():
                return ""
            
            # Create figure
            fig, ax = plt.subplots(figsize=(8, 6))
            
            # Create heatmap with seaborn
            sns.heatmap(
                corr_matrix,
                annot=True,
                fmt='.2f',
                cmap='coolwarm',
                center=0,
                square=True,
                linewidths=1,
                cbar_kws={'shrink': 0.8},
                ax=ax,
                vmin=-1,
                vmax=1
            )
            
            ax.set_title('Feature Correlation Heatmap', fontweight='bold', fontsize=16)
            plt.tight_layout()
            
            if save_path:
                plt.savefig(save_path)
                plt.close()
                return save_path
            else:
                return self._fig_to_base64(fig)
                
        except Exception as e:
            # If any error occurs, return empty string
            print(f"Error creating correlation heatmap: {e}")
            return ""
    
    def _fig_to_base64(self, fig) -> str:
        """
        Convert matplotlib figure to base64 encoded string
        
        Args:
            fig: Matplotlib figure object
        
        Returns:
            Base64 encoded image string
        """
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
    
    def generate_full_report(self, output_dir: str = './reports') -> Dict[str, str]:
        """
        Generate all visualizations and save to directory
        
        Args:
            output_dir: Directory to save report images
        
        Returns:
            Dictionary mapping plot names to file paths
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        plots = {
            'category_distribution': self.create_category_distribution_plot(
                f'{output_dir}/category_dist_{timestamp}.png'
            ),
            'cost_analysis': self.create_cost_analysis_plot(
                f'{output_dir}/cost_analysis_{timestamp}.png'
            ),
            'statistical_summary': self.create_statistical_summary_plot(
                f'{output_dir}/stats_summary_{timestamp}.png'
            ),
            'correlation_heatmap': self.create_correlation_heatmap(
                f'{output_dir}/correlation_{timestamp}.png'
            )
        }
        
        return plots
