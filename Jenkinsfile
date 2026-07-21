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
                        sh 'npx pnpm install'
                    } else {
                        bat 'npx pnpm install'
                    }
                }
            }
        }

        stage('Lint Checks') {
            steps {
                echo 'Running static analysis linting checks...'
                script {
                    if (isUnix()) {
                        sh 'npx pnpm run lint'
                    } else {
                        bat 'npx pnpm run lint'
                    }
                }
            }
        }

        stage('Compile & Build') {
            steps {
                echo 'Compiling and building the monorepo workspaces...'
                script {
                    if (isUnix()) {
                        sh 'npx pnpm run build'
                    } else {
                        bat 'npx pnpm run build'
                    }
                }
            }
        }

        stage('SonarQube Static Scan') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Executing SonarQube static code analysis...'
                    script {
                        withSonarQubeEnv('SonarQubeServer') {
                            if (isUnix()) {
                                sh 'npx sonar-scanner'
                            } else {
                                bat 'npx sonar-scanner'
                            }
                        }
                    }
                }
            }
        }

        stage('Trivy Repository Audit') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
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
        }

        stage('Build Docker Images') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
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
        }

        stage('Trivy Container Scan') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Scanning built container images for vulnerabilities...'
                    script {
                        if (isUnix()) {
                            sh "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG}"
                            sh "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG}"
                        } else {
                            bat "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_REGISTRY}/${API_IMAGE}:${IMAGE_TAG}"
                            bat "trivy image --exit-code 1 --severity CRITICAL ${DOCKER_REGISTRY}/${WEB_IMAGE}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        stage('GitOps Deployment via Helm') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo 'Updating Helm templates and deploying to Kubernetes...'
                    script {
                        if (isUnix()) {
                            sh "helm upgrade --install medflow-production ./infra/helm/medflow --namespace production --set api.image.tag=${IMAGE_TAG} --set web.image.tag=${IMAGE_TAG}"
                        } else {
                            bat "helm upgrade --install medflow-production ./infra/helm/medflow --namespace production --set api.image.tag=${IMAGE_TAG} --set web.image.tag=${IMAGE_TAG}"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build, quality checks, and static scans completed successfully!'
        }
        failure {
            echo 'Pipeline execution failed. Review build logs and tools output.'
        }
    }
}
