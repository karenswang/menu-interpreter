# menu-interpreter

## Description
Whether we are ordering food in person or picking restaurants online, menus are one of the most important points of information. However, most menus are designed for general purposes without specific information for people with special dietary needs or preferences. This often results in extra effort to look up dishes online, ask waiters, or spend longer time reading through the entire menu.

“What does a specific menu mean to you?” Our application will give you the answer. We want to build a tool that processes food menus, synthesizes information and provides a summary matching the overall collection of dishes to the users’ personal needs, including allergy history, nutrition needs, diet restrictions, religion, diet preferences, etc. 

This project is still under development. Check out our [clikcable prototype](https://www.figma.com/proto/xAeDwOrsWgZgg2KuNgx7E7/Menu-interpreter?type=design&node-id=3-9&t=CtS5OCRIeSJdXqBy-1&scaling=contain&page-id=0%3A1&starting-point-node-id=3%3A9&show-proto-sidebar=1&mode=design), [architecture design diagram](https://viewer.diagrams.net/?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1&title=CloudComputing.drawio#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1AbB7MkdI-gUoCcpGZ9RIoe2Lg8VSj7lm%26export%3Ddownload) and our [APIs](./api-swagger.yaml).

## Demo video
https://www.youtube.com/watch?v=o2SDX5g4kAM

## Code structure
```
menu-interpreter
│
├── frontend
│   ├── apiGateway-js-sdk
│   ├── assets
│   │   ├── login.js
│   │   ├── preference.js
│   │   ├── script.js
│   │   ├── search.js
│   │   └── upload.js
│   ├── css
│   │   └── login.css
│   │   └── preference.css
│   │   └── restaurants.css
│   │   └── upload.css
│   │   └── style.css
│   ├── image/
│   ├── login.html
│   ├── menu.html
│   ├── preference.html
│   ├── restaurants.html
│   └── upload.html
│
├── lambda
│   ├── extract-menu-text.py
│   ├── getUser.py
│   ├── loginUser.py
│   ├── registerUser.py
│   ├── searchRestaurants.py
│   └── updateUserPreference.py
│
├── menu-interpreter-test-swagger.yaml
│
├── openai_lambda
│   └── lambda_function.py
│
└── README.md
```

- frontend/: A directory containing all front-end related files.
    - apiGateway-js-sdk/: JavaScript SDK for interacting with AWS API Gateway.
    - assets/: Contains static assets like JavaScript files.
        - login.js: JavaScript file handling login functionality.
        - preference.js: JavaScript for user preference settings.
        - script.js: General purpose scripts (for navigation bar) for the frontend.
        - search.js: Handles search functionality in the frontend.
        - upload.js: Manages menu image uploads.
    - css/: Directory for all CSS files styling the frontend.
    - image/: Stores images used in the frontend.
    - login.html: HTML page for user login.
    - menu.html: this is the app landing page.
    - preference.html: Page for setting user preferences.
    - restaurants.html: page for searching and listing restuaurants and menus.
    - upload.html: Interface for uploading menu files and getting analysis.
- lambda/: Contains AWS Lambda functions.
    - extract-menu-text.py: Lambda function to extract text from menu images and stores them in opensearch.
    - getUser.py: Retrieves user data.
    - loginUser.py: Handles user login process.
    - registerUser.py: Manages new user registration.
    - searchRestaurants.py: Lambda function to search for restaurants.
    - updateUserPreference.py: Updates user preferences.
- menu-interpreter-test-swagger.yaml: Swagger configuration file for API testing.
- openai_lambda/: Lambda functions related to OpenAI services.
    - lambda_function.py: Main lambda function for OpenAI integration.
- README.md: Documentation file for the repository.

