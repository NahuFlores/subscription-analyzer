"""
Category model - Represents subscription categories with auto-categorization
"""
from typing import List, Dict, Optional


class Category:
    """
    Category class for organizing subscriptions
    Includes auto-categorization based on keywords
    """
    
    # Predefined categories with keywords for auto-categorization
    PREDEFINED_CATEGORIES = {
        'Streaming': {
            'icon': '🎬',
            'color': '#ef4444',
            'keywords': ['netflix', 'spotify', 'hulu', 'disney', 'prime video', 
                        'youtube', 'apple music', 'hbo', 'paramount', 'peacock',
                        'crunchyroll', 'funimation', 'tidal', 'deezer']
        },
        'Software': {
            'icon': '💻',
            'color': '#3b82f6',
            'keywords': ['adobe', 'microsoft', 'office', 'github', 'dropbox',
                        'google', 'icloud', 'notion', 'evernote', 'slack',
                        'zoom', 'canva', 'figma', 'grammarly']
        },
        'Fitness': {
            'icon': '💪',
            'color': '#10b981',
            'keywords': ['gym', 'fitness', 'peloton', 'strava', 'myfitnesspal',
                        'headspace', 'calm', 'yoga', 'crossfit', 'planet fitness']
        },
        'Gaming': {
            'icon': '🎮',
            'color': '#8b5cf6',
            'keywords': ['playstation', 'xbox', 'nintendo', 'steam', 'epic games',
                        'twitch', 'discord', 'ea play', 'ubisoft']
        },
        'News & Media': {
            'icon': '📰',
            'color': '#f59e0b',
            'keywords': ['news', 'times', 'post', 'journal', 'medium', 'substack',
                        'patreon', 'magazine', 'newspaper']
        },
        'Cloud Storage': {
            'icon': '☁️',
            'color': '#06b6d4',
            'keywords': ['cloud', 'storage', 'backup', 'drive', 'onedrive',
                        'box', 'mega', 'sync']
        },
        'Education': {
            'icon': '📚',
            'color': '#ec4899',
            'keywords': ['udemy', 'coursera', 'skillshare', 'masterclass',
                        'linkedin learning', 'pluralsight', 'datacamp', 'duolingo']
        },
        'Food & Delivery': {
            'icon': '🍔',
            'color': '#f97316',
            'keywords': ['uber eats', 'doordash', 'grubhub', 'postmates',
                        'instacart', 'hello fresh', 'blue apron']
        },
        'Transportation': {
            'icon': '🚗',
            'color': '#14b8a6',
            'keywords': ['uber', 'lyft', 'car', 'insurance', 'parking',
                        'toll', 'transit', 'metro']
        },
        'Other': {
            'icon': '📦',
            'color': '#6b7280',
            'keywords': []
        }
    }
    
    def __init__(self, name: str, icon: str = '📦', 
                 color: str = '#6b7280', keywords: Optional[List[str]] = None):
        self._name = name
        self._icon = icon
        self._color = color
        self._keywords = keywords or []
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def icon(self) -> str:
        return self._icon
    
    @property
    def color(self) -> str:
        return self._color
    
    @property
    def keywords(self) -> List[str]:
        return self._keywords.copy()
    
    @classmethod
    def auto_categorize(cls, subscription_name: str) -> str:
        """
        Automatically categorize a subscription based on its name
        
        Args:
            subscription_name: Name of the subscription
        
        Returns:
            Category name
        """
        name_lower = subscription_name.lower()
        
        # Check each category's keywords
        for category_name, category_data in cls.PREDEFINED_CATEGORIES.items():
            keywords = category_data['keywords']
            for keyword in keywords:
                if keyword in name_lower:
                    return category_name
        
        # Default to 'Other' if no match found
        return 'Other'
    
    @classmethod
    def get_category_info(cls, category_name: str) -> Dict:
        """Get category information (icon, color, keywords)"""
        return cls.PREDEFINED_CATEGORIES.get(category_name, cls.PREDEFINED_CATEGORIES['Other'])
    
    @classmethod
    def get_all_categories(cls) -> List[str]:
        """Get list of all category names"""
        return list(cls.PREDEFINED_CATEGORIES.keys())
    
    def to_dict(self) -> Dict:
        """Convert category to dictionary"""
        return {
            'name': self._name,
            'icon': self._icon,
            'color': self._color,
            'keywords': self._keywords
        }
    
    def __repr__(self) -> str:
        return f"Category(name={self._name}, icon={self._icon})"
    
    def __str__(self) -> str:
        return f"{self._icon} {self._name}"
