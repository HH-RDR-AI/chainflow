# chainflow-engine
ChainFlow Engine


### Build docker:

```
docker buildx build --push --tag docker-registry.dexguru.biz/dex.guru/chainflow_engine/chainflow_engine:1 --platform=linux/arm64,linux/amd64 .
```

### Deploy using helm

If you downloaded config from rancher
```
 export KUBECONFIG=~/Downloads/stage-k8s.yaml 
 helm upgrade --install chainflow-engine ./helm/engine  --wait -n stage --set imageTag=1 --set appName=chainflow-engine --set kubeNamespace=stage
```
Available at:

Application: https://chainflow-engine.dexguru.biz/camunda/app/welcome/default/
API: https://chainflow-engine.dexguru.biz/engine-rest
