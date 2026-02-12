
"""
AI Advisor - Generative AI module for financial insights
Uses Groq API (Llama 3) to analyze subscription data and provide actionable advice.
"""
import json
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from groq import Groq
from config import Config

logger = logging.getLogger(__name__)

# --- Constants ---

SYSTEM_PROMPT = """
You are an expert Financial Advisor specializing in subscription optimization. 
Your goal is to save the user money and identify wasteful spending.

Analyze the provided subscription list.

Output MUST be valid JSON with this structure:
{
    "summary": "A 1-sentence punched summary of their spending habits.",
    "insights": [
        "Specific actionable advice 1 (e.g., 'Switch Netflix to annual...')",
        "Specific actionable advice 2 (e.g., 'You have 3 music apps, cancel 2...')",
        "Specific actionable advice 3"
    ],
    "risk_score": 1-10 (1=safe, 10=wasteful)
}

Rules:
1. Context Matters: If they only have 1-2 subscriptions and low total cost (<$50), the Risk Score should be LOW (1-3). Don't panic over small amounts.
2. Categorization: Netflix/Spotify are "Entertainment", NOT "Utilities". AWS/GitHub are "Productivity" or "Work".
3. Be Direct: Suggest cheaper alternatives or annual plans if common (Disney+, HBO, etc.).
4. Detect Duplicates: Mark having multiple similar services (e.g. 2 music apps) as High Risk.
5. Do NOT use markdown in the JSON values.
"""

@dataclass
class AIAnalysisResult:
    summary: str
    insights: List[str]
    risk_score: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class AIAdvisor:
    """
    Intelligent Financial Advisor using Large Language Models.
    """
    
    def __init__(self):
        self.api_key = Config.GROQ_API_KEY
        self.model = Config.AI_MODEL_NAME
        self.client = self._initialize_client()

    def _initialize_client(self) -> Optional[Groq]:
        """Initialize and return the Groq client if API key is present."""
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found in configuration. AI features disabled.")
            return None
            
        try:
            client = Groq(api_key=self.api_key)
            logger.info(f"AI Advisor initialized with model: {self.model}")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            return None

    def _format_subscriptions(self, subscriptions: List[Dict]) -> str:
        """
        Convert list of subscriptions to a lightweight string representation for the LLM.
        """
        summary = []
        for sub in subscriptions:
            name = sub.get('name', 'Unknown')
            cost = sub.get('cost', 0)
            cycle = sub.get('billing_cycle', 'monthly')
            category = sub.get('category', 'Other')
            summary.append(f"- {name}: ${cost}/{cycle} ({category})")
        return "\n".join(summary)

    def _create_user_message(self, subscriptions: List[Dict], total_cost: float) -> str:
        """Construct the user message for the LLM."""
        subs_text = self._format_subscriptions(subscriptions)
        return f"""
        Here is my subscription portfolio:
        Total Monthly Cost: ${total_cost}
        
        Subscriptions:
        {subs_text}
        
        Analyze this and tell me how to save money.
        """

    def generate_insights(self, subscriptions: List[Dict], total_monthly_cost: float) -> Dict[str, Any]:
        """
        Generate personalized financial insights using GenAI.
        """
        if not self.client:
            return AIAnalysisResult(
                summary="AI features are currently unavailable.",
                insights=["AI Advisor is not configured. Please check your API Key."]
            ).to_dict()
            
        if not subscriptions:
            return AIAnalysisResult(
                summary="Add some subscriptions to get AI insights!",
                insights=["No subscriptions found to analyze."]
            ).to_dict()

        try:
            user_message = self._create_user_message(subscriptions, total_monthly_cost)
            
            completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=1024,
                response_format={"type": "json_object"}
            )
            
            response_content = completion.choices[0].message.content
            logger.debug(f"AI Response: {response_content}")
            
            # Parse JSON and wrap in dataclass for type safety (optional validation here)
            data = json.loads(response_content)
            return data # Returning directly as existing frontend expects specific keys
            
        except Exception as e:
            logger.error(f"Error generating AI insights: {e}", exc_info=True)
            return AIAnalysisResult(
                summary="AI Service unavailable.",
                insights=["Unable to generate insights.", f"Error: {str(e)}"]
            ).to_dict()
