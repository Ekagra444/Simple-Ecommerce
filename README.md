# Mini E-Commerce Platform

A simple e-commerce platform built with Next.js, Prisma, PostgreSQL, and OpenAI embeddings for vector search.
Visit [website](https://simple-ecommerce-nptz.onrender.com/)

## Features

- Product submission with name, price, description, and image
- Product listing
- Vector embeddings for product descriptions (OpenAI or mock) and when the OpenAI API key burns out, default search falls back to search input token in Product's name and its description

## Project Structure

- [`app/`](app/) - Next.js app directory (API routes, pages, layout)
- [`components/`](components/) - React UI components
- [`hooks/`](hooks/) - Custom React hooks
- [`lib/`](lib/) - Utility libraries (e.g., embeddings)
- [`prisma/`](prisma/) - Prisma schema and migrations
- [`public/`](public/) - Static assets
- [`styles/`](styles/) - Global styles

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/Ekagra444/Simple-Ecommerce.git
cd Simple-Ecommerce
```

### 2. Install dependencies

```sh
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your PostgreSQL and (optionally) OpenAI API key:

```sh
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key (optional; mock embeddings will be used if not set)

### 4. Set up the database

Run Prisma migrations to set up your database schema:

```sh
npx prisma migrate dev
```

### 5. Run the development server

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## High-Level Overview

This project allows users to submit and view products. When a product is submitted, its name and description are converted into a vector embedding (using OpenAI if configured, otherwise a mock embedding). These embeddings can be used for advanced search and recommendation features.

The UI is styled with Tailwind CSS and supports both light and dark themes.

## License

MIT
