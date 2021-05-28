sudo docker build -t local/racingservice .
sudo docker tag local/racingservice eu.gcr.io/$1/racingservice
sudo docker push eu.gcr.io/$1/racingservice

gcloud run deploy racingservice --image eu.gcr.io/$1/racingservice --platform managed --project $1 --region europe-west1 --allow-unauthenticated
