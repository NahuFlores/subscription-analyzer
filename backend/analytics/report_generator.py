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
        """Configure matplotlib and seaborn styling (memory-optimized for Render)"""
        self._sns.set_style("darkgrid")
        self._sns.set_palette("husl")
        
        # Memory-optimized settings for Render free tier (512MB)
        rc_params = {
            'figure.figsize': (8, 4),      # Reduced from (10, 6)
            'figure.dpi': 72,               # Reduced from 100
            'savefig.dpi': 100,             # Reduced from 300 (saves ~60% memory)
            'savefig.bbox': 'tight',
            'font.size': 9,                 # Slightly smaller
            'axes.titlesize': 12,
            'axes.labelsize': 10,
            'figure.max_open_warning': 5,   # Warn if too many figures open
        }
        self._plt.rcParams.update(rc_params)
        
        # Enable aggressive memory cleanup
        import matplotlib
        matplotlib.rcParams['agg.path.chunksize'] = 10000

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

    def generate_pdf_report(self) -> bytes:
        """Generate a consolidated PDF report with all visualizations"""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.units import inch
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.colors import HexColor, Color
            from reportlab.lib.enums import TA_CENTER, TA_LEFT
            from reportlab.lib import colors
            
            self._ensure_plotting_libs()
            
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Custom document class for header/footer
            class NumberedCanvas:
                def __init__(self, canvas, doc):
                    self.canvas = canvas
                    self.doc = doc
                    self.pages = []
                    
            def add_header_footer(canvas, doc):
                """Add header and footer to each page"""
                canvas.saveState()
                width, height = A4
                
                # Header - Title and line
                canvas.setFont('Helvetica-Bold', 10)
                canvas.setFillColor(HexColor('#6366f1'))
                canvas.drawString(0.5*inch, height - 0.35*inch, "Subscription Analytics Report")
                
                # Header line
                canvas.setStrokeColor(HexColor('#e2e8f0'))
                canvas.setLineWidth(1)
                canvas.line(0.5*inch, height - 0.45*inch, width - 0.5*inch, height - 0.45*inch)
                
                # Footer - Page number and date
                canvas.setFont('Helvetica', 9)
                canvas.setFillColor(HexColor('#64748b'))
                
                # Page number (centered)
                page_num = canvas.getPageNumber()
                canvas.drawCentredString(width / 2, 0.35*inch, f"Page {page_num}")
                
                # Date (right aligned)
                canvas.drawRightString(width - 0.5*inch, 0.35*inch, 
                    datetime.now().strftime('%B %d, %Y'))
                
                # Footer line
                canvas.line(0.5*inch, 0.5*inch, width - 0.5*inch, 0.5*inch)
                
                canvas.restoreState()
            
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=0.5*inch,
                leftMargin=0.5*inch,
                topMargin=0.7*inch,  # More space for header
                bottomMargin=0.7*inch  # More space for footer
            )
            
            # Styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=28,
                textColor=HexColor('#6366f1'),
                alignment=TA_CENTER,
                spaceAfter=10
            )
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=12,
                textColor=HexColor('#64748b'),
                alignment=TA_CENTER,
                spaceAfter=40
            )
            section_style = ParagraphStyle(
                'SectionTitle',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=HexColor('#1e293b'),
                spaceBefore=20,
                spaceAfter=10
            )
            
            elements = []
            
            # Title Page
            elements.append(Spacer(1, 1.5*inch))
            elements.append(Paragraph("Subscription Analytics Report", title_style))
            elements.append(Paragraph(
                f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
                subtitle_style
            ))
            
            # Summary stats
            active_subs = self._get_active_subscriptions()
            total_cost = sum(sub.cost for sub in active_subs)
            
            # Summary Table with better styling
            summary_data = [
                ['Metric', 'Value'],
                ['Total Active Subscriptions', str(len(active_subs))],
                ['Monthly Cost', f'${total_cost:.2f}'],
                ['Annual Projection', f'${total_cost * 12:.2f}']
            ]
            summary_table = Table(summary_data, colWidths=[3*inch, 2.5*inch])
            summary_table.setStyle(TableStyle([
                # Header row
                ('BACKGROUND', (0, 0), (-1, 0), HexColor('#6366f1')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                # Data rows
                ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f8fafc')),
                ('TEXTCOLOR', (0, 1), (-1, -1), HexColor('#1e293b')),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 11),
                # Alignment and padding
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'CENTER'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('LEFTPADDING', (0, 0), (-1, -1), 15),
                ('RIGHTPADDING', (0, 0), (-1, -1), 15),
                # Borders
                ('GRID', (0, 0), (-1, -1), 1, HexColor('#e2e8f0')),
                ('BOX', (0, 0), (-1, -1), 2, HexColor('#6366f1'))
            ]))
            elements.append(summary_table)
            elements.append(PageBreak())
            
            # Subscriptions Table
            if active_subs:
                elements.append(Paragraph("Your Subscriptions", section_style))
                elements.append(Spacer(1, 0.2*inch))
                
                # Build subscription data
                sub_data = [['Name', 'Category', 'Cost', 'Billing']]
                for sub in active_subs:
                    sub_data.append([
                        sub.name,
                        sub.category,
                        f'${sub.cost:.2f}',
                        sub.get_billing_cycle().capitalize()
                    ])
                
                sub_table = Table(sub_data, colWidths=[2.2*inch, 1.8*inch, 1.2*inch, 1.3*inch])
                
                # Base styles
                table_styles = [
                    # Header
                    ('BACKGROUND', (0, 0), (-1, 0), HexColor('#1e293b')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 11),
                    # Data
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 1), (-1, -1), HexColor('#374151')),
                    # Alignment
                    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                    ('ALIGN', (0, 1), (1, -1), 'LEFT'),
                    ('ALIGN', (2, 1), (2, -1), 'RIGHT'),
                    ('ALIGN', (3, 1), (3, -1), 'CENTER'),
                    # Padding
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                    ('TOPPADDING', (0, 0), (-1, -1), 10),
                    ('LEFTPADDING', (0, 0), (-1, -1), 12),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                    # Borders
                    ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e5e7eb')),
                    ('BOX', (0, 0), (-1, -1), 1.5, HexColor('#1e293b'))
                ]
                
                # Alternating row colors
                for i in range(1, len(sub_data)):
                    if i % 2 == 0:
                        table_styles.append(('BACKGROUND', (0, i), (-1, i), HexColor('#f9fafb')))
                    else:
                        table_styles.append(('BACKGROUND', (0, i), (-1, i), colors.white))
                
                sub_table.setStyle(TableStyle(table_styles))
                elements.append(sub_table)
                elements.append(PageBreak())
            
            # Generate plots and add to PDF
            plots = [
                ('Category Distribution', self.create_category_distribution_plot),
                ('Cost Analysis', self.create_cost_analysis_plot),
                ('Statistical Summary', self.create_statistical_summary_plot),
                ('Correlation Heatmap', self.create_correlation_heatmap)
            ]
            
            for title, plot_func in plots:
                base64_img = plot_func()
                if base64_img:
                    elements.append(Paragraph(title, section_style))
                    
                    # Convert base64 to image
                    img_data = base64.b64decode(base64_img.split(',')[1])
                    img_buffer = io.BytesIO(img_data)
                    img = Image(img_buffer, width=6.5*inch, height=4*inch)
                    elements.append(img)
                    elements.append(Spacer(1, 0.5*inch))
            
            # Build PDF with header/footer
            doc.build(elements, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
            buffer.seek(0)
            pdf_bytes = buffer.read()
            
            # Force memory cleanup after generating plots
            import gc
            self._plt.close('all')
            gc.collect()
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Error generating PDF report: {e}", exc_info=True)
            # Cleanup even on error
            import gc
            if self._plt:
                self._plt.close('all')
            gc.collect()
            return b""
