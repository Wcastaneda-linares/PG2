pipeline {
    agent any 

    stages {
        stage('Build') {
            steps {
                script {
                    sh 'npm install'
                    sh 'ng build --prod'
                }
            }
        }
        stage('Test') {
            steps {
                script {
                    sh 'ng test --watch=false'
                }
            }
        }
        stage('Deploy') {
            steps {
                // Aquí puedes agregar pasos para desplegar tu aplicación
            }
        }
    }
}
