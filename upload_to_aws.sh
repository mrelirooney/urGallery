cp ./ec2_key.pem ~/
chmod 400 ~/ec2_key.pem

rsync -avz   --exclude node_modules   --exclude .venv   --exclude __pycache__   -e "ssh -i ~/ec2_key.pem"   . ec2-user@ec2-18-224-202-229.us-east-2.compute.amazonaws.com:~/urgallery
ssh -i ~/ec2_key.pem ec2-user@ec2-18-224-202-229.us-east-2.compute.amazonaws.com

set -e

EC2_USER=ec2-user
EC2_HOST=ec2-18-224-202-229.us-east-2.compute.amazonaws.com
EC2_KEY=~/ec2_key.pem
APP_DIR=~/urgallery

echo "🚀 Connecting to EC2..."

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << EOF
  set -e
  echo "📂 Moving to app directory"
  cd $APP_DIR

  echo "📥 Pulling latest code"
  git pull origin main

  echo "🐳 Building and starting containers"
  docker compose down
  docker compose up --build -d

  echo "✅ Deployment complete"
EOF