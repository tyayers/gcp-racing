docker build -t local/racingservice .
docker tag local/racingservice eu.gcr.io/$1/racingservice
docker push eu.gcr.io/$1/racingservice

gcloud run deploy racingservice --image eu.gcr.io/$1/racingservice --platform managed --project $1 --region europe-west1 --allow-unauthenticated
