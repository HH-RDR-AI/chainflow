# Use the official nginx image as the base
FROM nginx:latest

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy static website content into the container at /usr/share/nginx/html
COPY ./_site/ /usr/share/nginx/html/

# Expose port 80 for HTTP
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
