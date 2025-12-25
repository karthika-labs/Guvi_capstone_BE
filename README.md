# Recipe Hub - Backend API

Backend API for Recipe Hub application built with Node.js, Express, and MongoDB.

## Features

### User Authentication
- User Registration, Login, Logout, and Password Reset

### Recipe Management
- Create, View, Edit, and Delete recipes
- Upload images with recipes
- Recipes can be rated and commented on by users

### Search & Filter
- Advanced recipe search
- Filter by meal type and food preferences

### Social Features
- Like and favorite recipes
- Comment on and rate recipes
- Follow and unfollow other users

### User Profiles
- View and edit user profiles
- Display user recipes, favorites, and followers

### Week Planner
- Plan meals for the week using saved recipes

### Shopping List
- Automatically generate shopping lists from planned meals
- Shopping lists can be printed, downloaded, and shared

### Responsive Design
- Mobile-first and fully responsive UI using Tailwind CSS

### Image Gallery
- Swiper-based image carousel for recipe images


##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Cloudinary Account** (for file storage)

##  Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd Guvi_capstone_BE
   ```

2. **Install dependencies**
   ```bash
   npm install
 
3. **Set up MongoDB**
   - Option 1: Use MongoDB Atlas (cloud)
     - Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a cluster and get your connection string
   - Option 2: Use local MongoDB
     - Install MongoDB locally
     - Connection string: `mongodb://localhost:27017/recipehub`

4. **Set up Cloudinary**
   - Create an account at [Cloudinary](https://cloudinary.com/)
   - Get your Cloud Name, API Key, and API Secret from the dashboard

## Running the Application

### Development Mode
```bash
node index.js
```

##  API Endpoints

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

##  Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

##  Dependencies

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

## Environment Variables

Make sure to set all required environment variables in your `.env` file. Never commit the `.env` file to version control.

##  Notes

- The server uses CORS with allowed origins:
  - Production: `https://recipeslab.netlify.app`
  - Development: `http://localhost:5173` and `http://localhost:3000`
- JWT tokens are used for authentication. Tokens should be stored securely on the client side.
- Cloudinary is used for storing recipe images and videos.
- Password reset functionality requires email configuration.
