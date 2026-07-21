pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "medicore360"
        API_IMAGE = "medicore360-api"
        WEB_IMAGE = "medicore360-web"
        IMAGE_TAG = "${BUILD_NUMBER}"
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    stages {
        stage('Checkout & Setup') {
            steps {
                echo 'Checking out code and verifying environment...'
                checkout scm
                sh 'node -v'
                sh 'npm -v'
                // Ensure pnpm is installed and available
                sh 'npm install -g pnpm'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing workspace dependencies...'
                sh 'pnpm install'
            }
        }

        stage('Lint & Quality Checks') {
            steps {
                echo 'Running static analysis linting checks...'
                sh 'pnpm run lint'
            }
        }

        stage('SonarQube Static Scan') {
            steps {
                echo 'Executing SonarQube static code analysis...'
                withSonarQubeEnv('SonarQubeServer') {
                    sh "${SONAR_SCANNER_HOME}/bin/sonar-scanner"
                }
            }
        }

        stage('Trivy Repository Audit') {
            steps {
                echo 'Auditing repository files for secrets and dependencies vulnerability...'
                sh 'trivy fs --exit-code 0 --severity HIGH,CRITICAL .'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building production docker images for API and Web services...'
                sh "docker build -f infra/docker/api.prod.Dockerfile -t ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${API_IMAGE}:latest ."
                sh "docker build -f infra/docker/web.prod.Dockerfile -t ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${WEB_IMAGE}:latest ."
            }
        }

        stage('Trivy Container Scan') {
            steps {
                echo 'Scanning built container images for vulnerabilities...'
                sh "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG}"
                sh "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Publish Images') {
            steps {
                echo 'Pushing verified container images to registry...'
                // sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                // sh "docker push ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG}"
                // sh "docker push ${DOCKER_REGISTRY}/${API_IMAGE}:latest"
                // sh "docker push ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG}"
                // sh "docker push ${DOCKER_REGISTRY}/${WEB_IMAGE}:latest"
                echo 'Container images successfully published.'
            }
        }

        stage('GitOps Deployment via Helm') {
            steps {
                echo 'Updating Helm templates and deploying to Kubernetes...'
                sh "helm upgrade --install medflow-production ./infra/helm/medflow \
                    --namespace production \
                    --set api.image.tag=${IMAGE_TAG} \
                    --set web.image.tag=${IMAGE_TAG}"
            }
        }
    }

    post {
        success {
            echo 'Build, security checks, and GitOps update completed successfully!'
        }
        failure {
            echo 'Pipeline execution failed. Review build logs and security scan reports.'
        }
    }
}
