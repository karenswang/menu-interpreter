import json
import os
import requests

# Retrieve Yelp API key from environment variable
api_key = os.environ['YELP_API_KEY']

# Define the header for Yelp API request
headers = {
    'Authorization': f'Bearer {api_key}',
    'Accept': 'application/json'
}

# Lambda handler function
def lambda_handler(event, context):
    # Extract query parameter from event object
    keyword = event.get("queryStringParameters", {}).get("keyword", "restaurant")
    
    # Yelp API endpoint
    yelp_url = "https://api.yelp.com/v3/businesses/search"
    
    # Parameters for Yelp API call
    params = {
        'term': keyword + ' restaurant',
        'location': 'manhattan',
        'limit': 10,
    }
    
    # Make the request to Yelp API
    response = requests.get(yelp_url, headers=headers, params=params)
    
    if response.status_code == 200:
        fetched_restaurants = response.json().get('businesses', [])
        
        # Process and format the response
        restaurants_data = [
            {
                'business_id': restaurant['id'],
                'name': restaurant['name'],
                'address': restaurant['location']['address1'],
                'image_url': restaurant.get('image_url'),
                'category': ", ".join([category['title'] for category in restaurant.get('categories', [])])
            }
            for restaurant in fetched_restaurants
        ]

        # Return the formatted data
        return {
            'statusCode': 200,
            'body': json.dumps(restaurants_data),
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    else:
        return {
            'statusCode': response.status_code,
            'body': json.dumps({'message': 'Error calling Yelp API'}),
            'headers': {
                'Content-Type': 'application/json'
            }
        }

