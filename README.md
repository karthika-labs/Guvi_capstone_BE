# Recipe Hub - Backend API

Backend API for Recipe Hub application built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Recipe Management**: CRUD operations for recipes
- **File Storage**: Cloudinary integration for image and video storage
- **Comments & Ratings**: User interaction features
- **Favorites**: Save favorite recipes
- **Week Planner**: Meal planning functionality
- **Shopping List**: Generate shopping lists from meal plans
- **Search**: Advanced recipe search with filters

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for file storage)

## 🛠️ Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd Guvi_capstone_BE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following variables:
   ```env
   # Server Configuration
   port=5001

   # MongoDB Configuration
   mongo_DB_url=your_mongodb_connection_string

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email Configuration (for password reset)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

4. **Set up MongoDB**
   - Option 1: Use MongoDB Atlas (cloud)
     - Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a cluster and get your connection string
   - Option 2: Use local MongoDB
     - Install MongoDB locally
     - Connection string: `mongodb://localhost:27017/recipehub`

5. **Set up Cloudinary**
   - Create an account at [Cloudinary](https://cloudinary.com/)
   - Get your Cloud Name, API Key, and API Secret from the dashboard

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-reload on file changes.

### Production Mode
```bash
npm start
```
This will start the server using Node.js.

The server will run on `http://localhost:5001` (or the port specified in your `.env` file).

## 📁 Project Structure

```
Guvi_capstone_BE/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary configuration
├── controllers/
│   ├── commentController.js
│   ├── favoriteController.js
│   ├── LikesController.js
│   ├── listController.js
│   ├── plansController.js
│   ├── ratingController.js
│   ├── recipeController.js
│   ├── searchRecipes.js
│   └── userController.js
├── middleware/
│   └── authMiddleware.js  # JWT authentication middleware
├── models/
│   ├── comments.js
│   ├── favorites.js
│   ├── planner.js
│   ├── rating.js
│   ├── recipe.js
│   ├── shoppingList.js
│   └── users.js
├── routers/
│   └── routes.js          # API routes
├── utils/
│   └── sendEmails.js      # Email utility for password reset
├── index.js               # Entry point
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /reset-password` - Request password reset
- `POST /reset-password/:token` - Reset password with token

### Recipes
- `GET /recipes` - Get all recipes
- `GET /recipes/:id` - Get recipe by ID (public)
- `POST /recipes` - Create new recipe (protected)
- `PUT /recipes/:id` - Update recipe (protected)
- `DELETE /recipes/:id` - Delete recipe (protected)
- `GET /recipes/search` - Search recipes
- `POST /recipes/:id/like` - Like a recipe (protected)
- `DELETE /recipes/:id/like` - Unlike a recipe (protected)

### Comments
- `POST /comments` - Add comment (protected)
- `PUT /comments/:id` - Update comment (protected)
- `DELETE /comments/:id` - Delete comment (protected)

### Ratings
- `POST /ratings` - Add rating (protected)
- `PUT /ratings/:id` - Update rating (protected)

### Favorites
- `GET /favorites` - Get user's favorites (protected)
- `POST /favorites/:recipeId` - Add to favorites (protected)
- `DELETE /favorites/:recipeId` - Remove from favorites (protected)

### Week Planner
- `GET /plans` - Get user's week plans (protected)
- `POST /plans` - Create week plan (protected)
- `GET /plans/:id` - Get week plan by ID (protected)
- `PUT /plans/:id` - Update week plan (protected)
- `DELETE /plans/:id` - Delete week plan (protected)

### Shopping List
- `GET /lists` - Get user's shopping lists (protected)
- `POST /lists` - Create shopping list (protected)
- `PUT /lists/:id` - Update shopping list (protected)
- `DELETE /lists/:id` - Delete shopping list (protected)

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile (protected)
- `POST /users/:id/follow` - Follow user (protected)
- `DELETE /users/:id/follow` - Unfollow user (protected)

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT token handling
- **bcryptjs**: Password hashing
- **cloudinary**: File storage and management
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **nodemailer**: Email sending for password reset

## 🔧 Development Dependencies

- **nodemon**: Auto-reload server during development

## 🌐 Environment Variables

Make sure to set all required environment variables in your `.env` file. Never commit the `.env` file to version control.

## 📝 Notes

- The server uses CORS with `origin: '*'` for development. Consider restricting this in production.
- JWT tokens are used for authentication. Tokens should be stored securely on the client side.
- Cloudinary is used for storing recipe images and videos.
- Password reset functionality requires email configuration.

## 🐛 Troubleshooting

1. **Database connection failed**
   - Check your MongoDB connection string
   - Ensure MongoDB is running (if using local instance)
   - Verify network access (if using MongoDB Atlas)

2. **Cloudinary upload fails**
   - Verify your Cloudinary credentials in `.env`
   - Check your Cloudinary account limits

3. **JWT errors**
   - Ensure `JWT_SECRET` is set in `.env`
   - Verify token is being sent in the Authorization header

## 📄 License

This project is part of the Guvi Capstone project.

