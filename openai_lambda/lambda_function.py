import json
import boto3
import openai
from openai import OpenAI

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    user_table = dynamodb.Table('user')
    menu_table = dynamodb.Table('menu-items')
    
    openai.api_key = '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'
    client = OpenAI(
        api_key=openai.api_key,
        )
    
    body = json.loads(event['body'])
    username = body['username']
    menu_id = event['pathParameters']['menu_id']
         
    user_data = user_table.get_item(Key={'username': username})
    if 'Item' not in user_data or not user_data['Item'].get('isLoggedIn'):
        return {
            'statusCode': 403,
            'body': json.dumps('User is not logged in or does not exist.')
        }
    
    preferences = user_data['Item']['preferences']
    
    menu_data = menu_table.get_item(Key={'menu_id': menu_id})
    if 'Item' not in menu_data:
        return {
            'statusCode': 404,
            'body': json.dumps('Menu does not exist.')
        }
        
    menu_items = menu_data['Item']['menu_text']
    restaurant_name = menu_data['Item']['restaurant_name']
    
    report = generate_report(client, menu_items, restaurant_name, preferences)

    return {
        'statusCode': 200,
        'body': json.dumps(report)
    }
    
def generate_report(client, menu_items, restaurant_name, preferences):
    completion = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You have information about a restaurant's dishes and a user's dietary preferences."},
        {"role": "user", "content": f"Menu items: {menu_items}\nRestaurant name: {restaurant_name}\nUser preferences: {json.dumps(preferences)}\n\nGenerate a report on the matchness of the menu to the user preferences. Use this as an example:\
        Restaurant: David Burke Tavern\nMost dominant food category: seafood (80%)\
        Recommended: cauliflower steak, roasted rack of lamb, wild mushroom ravioli\
        Avoid: fire roasted halibut, diver scallops, lobster salad\
        Your match: low\
        Reasoning: based on your profile, you should avoid food with high uric acid. Since most dishes in David Burke Tavern are seafood, we do not recommend dining here."}
    ]
    )
    answer = completion.choices[0].message.content
    return answer