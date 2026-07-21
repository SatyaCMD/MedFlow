pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "medicore360"
        API_IMAGE = "medicore360-api"
        WEB_IMAGE = "medicore360-web"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout & Setup') {
            steps {
                echo 'Checking out code and verifying environment...'
                checkout scm
                script {
                    if (isUnix()) {
                        sh 'node -v'
                        sh 'npm -v'
                        sh 'npm install -g pnpm'
                    } else {
                        bat 'node -v'
                        bat 'npm -v'
                        bat 'npm install -g pnpm'
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing workspace dependencies...'
                script {
                    if (isUnix()) {
                        sh 'pnpm install'
                    } else {
                        bat 'pnpm install'
                    }
                }
            }
        }

        stage('Lint Checks') {
            steps {
                echo 'Running static analysis linting checks...'
                script {
                    if (isUnix()) {
                        sh 'pnpm run lint'
                    } else {
                        bat 'pnpm run lint'
                    }
                }
            }
        }

        stage('Compile & Build') {
            steps {
                echo 'Compiling and building the monorepo workspaces...'
                script {
                    if (isUnix()) {
                        sh 'pnpm run build'
                    } else {
                        bat 'pnpm run build'
                    }
                }
            }
        }

        // The following advanced scanning/dockerization stages are templates.
        // To run them, make sure the required tools (Trivy, SonarQube Scanner, Docker) are installed on your Jenkins host.
        /*
        stage('SonarQube Static Scan') {
            steps {
                echo 'Executing SonarQube static code analysis...'
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQubeServer') {
                        if (isUnix()) {
                            sh "${scannerHome}/bin/sonar-scanner"
                        } else {
                            bat "${scannerHome}/bin/sonar-scanner.bat"
                        }
                    }
                }
            }
        }

        stage('Trivy Repository Audit') {
            steps {
                echo 'Auditing repository files for secrets and dependencies...'
                script {
                    if (isUnix()) {
                        sh 'trivy fs --exit-code 0 --severity HIGH,CRITICAL .'
                    } else {
                        bat 'trivy fs --exit-code 0 --severity HIGH,CRITICAL .'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building production docker images for API and Web services...'
                script {
                    if (isUnix()) {
                        sh "docker build -f infra/docker/api.prod.Dockerfile -t ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${API_IMAGE}:latest ."
                        sh "docker build -f infra/docker/web.prod.Dockerfile -t ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${WEB_IMAGE}:latest ."
                    } else {
                        bat "docker build -f infra/docker/api.prod.Dockerfile -t ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${API_IMAGE}:latest ."
                        bat "docker build -f infra/docker/web.prod.Dockerfile -t ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${WEB_IMAGE}:latest ."
                    }
                }
            }
        }
        */
    }

    post {
        success {
            echo 'Build, quality checks, and compilation completed successfully!'
        }
        failure {
            echo 'Pipeline execution failed. Review build logs and tools output.'
        }
    }
}
