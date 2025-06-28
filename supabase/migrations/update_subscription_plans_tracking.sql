/*
  # Update Subscription Plans with Tracking Features

  1. Updates
    - Add tracking and snippet features to subscription plans
    - Update feature sets for each tier
    - Add tracking-specific features to plans

  2. Features Added
    - script_injection: Basic tracking codes (Pro+)
    - advanced_tracking: Advanced tracking & retargeting (VIP)
    - optin_forms: Optin form integration (Pro+)
    - custom_snippets: Custom code injection (VIP)
*/

-- Update FREE plan features
UPDATE subscription_plans 
SET features = jsonb_set(
  features,
  '{script_injection}',
  'false'
)
WHERE id = 'free';

-- Update PRO plan features
UPDATE subscription_plans 
SET features = jsonb_set(
  jsonb_set(
    jsonb_set(
      features,
      '{script_injection}',
      'true'
    ),
    '{optin_forms}',
    'true'
  ),
  '{advanced_tracking}',
  'false'
)
WHERE id = 'pro';

-- Update VIP plan features  
UPDATE subscription_plans 
SET features = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        features,
        '{script_injection}',
        'true'
      ),
      '{optin_forms}',
      'true'
    ),
    '{advanced_tracking}',
    'true'
  ),
  '{custom_snippets}',
  'true'
)
WHERE id = 'vip';

-- Update plan descriptions to include tracking features
UPDATE subscription_plans 
SET description = 'Perfect for personal use with basic link shortening and analytics'
WHERE id = 'free';

UPDATE subscription_plans 
SET description = 'Advanced tools for marketers including tracking codes, cloaking, and A/B testing'
WHERE id = 'pro';

UPDATE subscription_plans 
SET description = 'Everything in Pro plus unlimited links, advanced tracking, custom domains, and VIP support'
WHERE id = 'vip';
