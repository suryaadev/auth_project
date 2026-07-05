pipeline {
    agent {
        label 'ubuntu'
    }
    stages {
        stage('Clone') {
            steps {
                echo 'Cloning the repository...'
                git url: 'https://github.com/suryaadev/auth_project.git', branch: 'main'
            }
        }
        stage('Build') {
            steps {
                echo 'Building.....'
                sh '''
                    cd backend
                    docker build -t auth_backend .
                    cd ../frontend
                    docker build -t auth_frontend .
                '''
            }
        }
        stage('Push to dockerHub') {
            steps {
                echo 'pushing to dockerHub.....'
                withCredentials([usernamePassword(credentialsId:"dockerhub", passwordVariable:"pass", usernameVariable:"user")]) {
                    sh """
                        docker tag auth_backend ${env.user}/auth_backend:latest
                        docker tag auth_frontend ${env.user}/auth_frontend:latest
                        docker login -u ${env.user} -p ${pass}
                        docker push ${env.user}/auth_backend:latest
                        docker push ${env.user}/auth_frontend:latest
                    """
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying.....'
                sh '''
                    sh 'docker rm -f $(docker ps -aq --filter "name=auth_backend")
                    sh 'docker rm -f $(docker ps -aq --filter "name=auth_frontend")
                    docker compose up -d
                '''
            }
        }
    }
    
}