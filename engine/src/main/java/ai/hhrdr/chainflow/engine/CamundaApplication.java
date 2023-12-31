package ai.hhrdr.chainflow.engine;

import org.camunda.bpm.spring.boot.starter.annotation.EnableProcessApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.scheduling.annotation.EnableScheduling;



@SpringBootApplication
@EnableScheduling
@Configuration
@EnableProcessApplication("chainflow-engine")
public class CamundaApplication extends SpringBootServletInitializer {

  public static void main(String... args) {
    SpringApplication.run(CamundaApplication.class, args);
  }


  /**
   * Spring Servlet Initializer
   *
   * @param application application
   * @return SpringApplicationBuilder
   */
  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
    return application.sources(CamundaApplication.class);
  }

  /**
   * Property placeholder configurer needed to process @Value annotations
   */
  @Bean
  public static PropertySourcesPlaceholderConfigurer propertyConfigurer() {
    return new PropertySourcesPlaceholderConfigurer();
  }
//
//  @Bean
//  public FilterRegistrationBean authenticationFilter() {
//    FilterRegistrationBean registration = new FilterRegistrationBean();
//    Filter myFilter = new ProcessEngineAuthenticationFilter();
//    registration.setFilter(myFilter);
//    registration.addUrlPatterns("/engine-rest/*");
//    registration.addInitParameter("authentication-provider",
//            "org.camunda.bpm.engine.rest.security.auth.impl.HttpBasicAuthenticationProvider");
//    registration.setName("camunda-auth");
//    registration.setOrder(1);
//    return registration;
//  }

}
