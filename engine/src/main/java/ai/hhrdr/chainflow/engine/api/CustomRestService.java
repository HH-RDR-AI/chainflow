package ai.hhrdr.chainflow.engine.api;
//import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.repository.Deployment;
import org.camunda.bpm.engine.repository.DeploymentBuilder;
import org.camunda.bpm.engine.rest.dto.runtime.ProcessInstanceDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import org.camunda.bpm.engine.RepositoryService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

//@Slf4j
//@Component
@Path("/evm/deployment/create")
public class CustomRestService {

    @Autowired
    private RepositoryService repositoryService;

//    @GET
//    @Produces(MediaType.APPLICATION_JSON)
//    public String getList() {
//        return "Test Successful!";
//    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public ResponseEntity<String> customDeploymentCreate(
//            @RequestParam("deployment-name") String name,
//                                                         @RequestParam("enable-duplicate-filtering") Boolean enableDuplicateFiltering,
//                                                         @RequestParam("deploy-changed-only") Boolean deployChangedOnly,
//                                                         @RequestParam("deployment-source") String source,
//                                                         // other parameters Camunda uses...
//                                                         MultipartFile file
    ) {

        // Your custom logic here
        System.out.println("MY LOGIC !!!!!");

//        // Then use Camunda's RepositoryService to deploy
//        DeploymentBuilder deploymentBuilder = repositoryService.createDeployment()
//                .name(name)
////                .enableDuplicateFiltering(enableDuplicateFiltering, deployChangedOnly)
//                .source(source);

//        // Add your resource (you'll need to handle the MultipartFile conversion)
//        try {
//            InputStream inputStream = file.getInputStream();
//            deploymentBuilder.addInputStream(file.getOriginalFilename(), inputStream);
//        } catch (IOException e) {
//            // Handle the exception
//        }
//
//        Deployment deployment = deploymentBuilder.deploy();
//
//        // Return your custom response or Camunda's deployment object
//        return ResponseEntity.ok(deployment.getId());
        return ResponseEntity.ok("TEST");
    }


}













//package ai.hhrdr.chainflow.engineapi;
//
//import org.camunda.bpm.engine.RepositoryService;
//import org.camunda.bpm.engine.repository.Deployment;
//import org.camunda.bpm.engine.repository.DeploymentBuilder;
//import org.camunda.bpm.engine.repository.DeploymentQuery;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.annotation.Primary;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.util.List;
//
//
//@RestController
//@RequestMapping("/engine-rest")
//public class CustomDeploymentController {
//
//    @Autowired
//    private RepositoryService repositoryService;
//
//    @PostMapping("/deployment/create")
//    public ResponseEntity<String> customDeploymentCreate(@RequestParam("deployment-name") String name,
//                                                         @RequestParam("enable-duplicate-filtering") Boolean enableDuplicateFiltering,
//                                                         @RequestParam("deploy-changed-only") Boolean deployChangedOnly,
//                                                         @RequestParam("deployment-source") String source,
//                                                         // other parameters Camunda uses...
//                                                         MultipartFile file) {
//
//        // Your custom logic here
//        System.out.println("MY LOGIC !!!!!");
//
//        // Then use Camunda's RepositoryService to deploy
//        DeploymentBuilder deploymentBuilder = repositoryService.createDeployment()
//                .name(name)
////                .enableDuplicateFiltering(enableDuplicateFiltering, deployChangedOnly)
//                .source(source);
//
//        // Add your resource (you'll need to handle the MultipartFile conversion)
//        try {
//            InputStream inputStream = file.getInputStream();
//            deploymentBuilder.addInputStream(file.getOriginalFilename(), inputStream);
//        } catch (IOException e) {
//            // Handle the exception
//        }
//
//        Deployment deployment = deploymentBuilder.deploy();
//
//        // Return your custom response or Camunda's deployment object
//        return ResponseEntity.ok(deployment.getId());
//    }
//
//    @Primary
//    @GetMapping("/engine-rest/deployment")
//    public ResponseEntity<List<Deployment>> getDeployments(
//            @RequestParam(value = "name", required = false) String name,
//            @RequestParam(value = "nameLike", required = false) String nameLike,
//            @RequestParam(value = "source", required = false) String source,
//            @RequestParam(value = "tenantIdIn", required = false) List<String> tenantIds,
//            // You can continue adding more parameters based on what you need...
//            @RequestParam(value = "firstResult", required = false) Integer firstResult,
//            @RequestParam(value = "maxResults", required = false) Integer maxResults) {
//
//        DeploymentQuery query = repositoryService.createDeploymentQuery();
//
//        System.out.println("!!!!!!!!!!!!!!!!!!!");
//
//        List<Deployment> deployments = query.list();
//
//        return new ResponseEntity<>(deployments, HttpStatus.OK);
//    }
//
//    @GetMapping("/engine-rest/test")
//    public String test() {
//        return "Test Successful!";
//    }
//}
