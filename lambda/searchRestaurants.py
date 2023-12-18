import json
import os
import requests
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3

HOST = 'search-restaurant-menus-ts66x77o3tq7lapsmpgpjjcqli.us-east-1.es.amazonaws.com'
REGION = 'us-east-1'
service = 'es'
INDEX = 'menus'
    
def get_awsauth(region, service):
    cred = boto3.Session().get_credentials()
    return AWS4Auth(cred.access_key,
                    cred.secret_key,
                    region,
                    service,
                    session_token=cred.token)


def lambda_handler(event, context):
    print(event)
    
    # Pagination parameters
    page = int(event.get('queryStringParameters', {}).get('page', 1))
    pageSize = int(event.get('queryStringParameters', {}).get('limit', 10))
    start = (page - 1) * pageSize  # Calculate the starting index
    
    # Query parameter and type
    query_param = event.get('queryStringParameters', {}).get('keyword', '').lower()
    search_type = event.get('queryStringParameters', {}).get('type', '')
    username = event.get('queryStringParameters', {}).get('username', None)

    # Prepare response format
    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*'
        },
        "body": None
    }

    try:
        # search_query = ' AND '.join(query_param)
        client = OpenSearch(hosts=[{
        'host': HOST,
        'port': 443
        }],
                        http_auth=get_awsauth(REGION, 'es'),
                        use_ssl=True,
                        verify_certs=True,
                        connection_class=RequestsHttpConnection)
        


    
        query_body = {
            'query': {
                'bool': {
                    'must': [{'query_string': {'default_field': 'menu_text' if search_type != 'restaurant' else 'restaurant_name', 'query': f'*{query_param}*'}}]
                }
            }
        }   
        
        if username:
            query_body['query']['bool']['filter'] = [{'term': {'uploaded_by': username}}]
        
        search_response = client.search(
            index=INDEX,
            body=query_body
        )
        
        
        # search_response = client.search(
        #     index=INDEX,
        #     body={
        #             'query': {
        #                 'query_string': {
        #                     'default_field': search_field,
        #                     'query': f'*{query_param}*'
        #                 }
        #             }
        #         }
        # )
        print(search_response)

        hits = search_response['hits']['hits']
        total_hits = search_response['hits']['total']['value']  # Get total number of hits
        total_pages = (total_hits + pageSize - 1) // pageSize  # Calculate total number of pages

        results = []
        for hit in hits:
            source = hit['_source']
            restaurant_name = source.get('restaurant_name')
            menu_text = source.get('menu_text')
            uploaded_by = source.get('uploaded_by')
            if 'bucket' in source and 'object_key' in source:
                bucket = source.get('bucket')
                object_key = source.get('object_key')
            
                # Return a pre-signed photo URL for frontend rendering
                photo_url = f'https://{bucket}.s3.amazonaws.com/{object_key}'
                s3_client = boto3.client('s3')
                presigned_url = s3_client.generate_presigned_url('get_object',
                                                     Params={'Bucket': bucket,
                                                             'Key': object_key},
                                                     ExpiresIn=3600)  # URL expires in 1 hour
                record = {
                    "restaurant_name": restaurant_name,
                    "menu_text": menu_text,
                    "uploaded_by": uploaded_by,
                    "url": presigned_url
                }
            else:
                record = {
                    "restaurant_name": restaurant_name,
                    "menu_text": menu_text,
                    "uploaded_by": uploaded_by,
                    "url": None
                }
            results.append(record)
        response["body"] = json.dumps({
                "results": results,
                "totalPages": total_pages
            })



    except Exception as error:
        print(error)
        response["statusCode"] = 500
        response["body"] = json.dumps({"error": "An error occurred during the query."})

    return response
