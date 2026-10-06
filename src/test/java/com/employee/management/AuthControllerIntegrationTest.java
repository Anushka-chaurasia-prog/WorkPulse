package com.employee.management;

import com.employee.management.dto.DepartmentRequest;
import com.employee.management.dto.LoginRequest;
import com.employee.management.dto.RegisterRequest;
import com.employee.management.entity.User;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("1. Successful user registration - 201 Created")
    void shouldRegisterUserSuccessfully() throws Exception {
        String username = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String email = username + "@example.com";
        RegisterRequest request = new RegisterRequest(username, email, "StrongPassword123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message", is("User registered successfully")))
                .andExpect(jsonPath("$.username", is(username)));

        Optional<User> savedUser = userRepository.findByUsername(username);
        assertThat(savedUser).isPresent();
        assertThat(savedUser.get().getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("2. Password is stored as BCrypt hash, not plaintext")
    void shouldStorePasswordAsBCryptHash() throws Exception {
        String username = "hash_user_" + UUID.randomUUID().toString().substring(0, 8);
        String plainPassword = "MySecretPassword123";
        RegisterRequest request = new RegisterRequest(username, username + "@example.com", plainPassword);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        User user = userRepository.findByUsername(username).orElseThrow();
        assertThat(user.getPassword()).isNotEqualTo(plainPassword);
        assertThat(passwordEncoder.matches(plainPassword, user.getPassword())).isTrue();
    }

    @Test
    @DisplayName("3. Reject duplicate username during registration - 409 Conflict")
    void shouldRejectDuplicateUsername() throws Exception {
        String username = "dup_user_" + UUID.randomUUID().toString().substring(0, 8);
        userRepository.saveAndFlush(new User(username, "email1_" + username + "@test.com", passwordEncoder.encode("pass123"), "USER"));

        RegisterRequest request = new RegisterRequest(username, "email2_" + username + "@test.com", "pass123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("CONFLICT")));
    }

    @Test
    @DisplayName("4. Reject duplicate email during registration - 409 Conflict")
    void shouldRejectDuplicateEmail() throws Exception {
        String unique = UUID.randomUUID().toString().substring(0, 8);
        String sharedEmail = "shared." + unique + "@test.com";
        userRepository.saveAndFlush(new User("user1_" + unique, sharedEmail, passwordEncoder.encode("pass123"), "USER"));

        RegisterRequest request = new RegisterRequest("user2_" + unique, sharedEmail, "pass123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.error", is("CONFLICT")));
    }

    @Test
    @DisplayName("5. Reject invalid registration data (short password, bad email) - 400 Bad Request")
    void shouldRejectInvalidRegistrationData() throws Exception {
        RegisterRequest request = new RegisterRequest("", "invalid-email", "123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.validationErrors.username", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.email", notNullValue()))
                .andExpect(jsonPath("$.validationErrors.password", notNullValue()));
    }

    @Test
    @DisplayName("6. Successful login returns JWT token - 200 OK")
    void shouldLoginSuccessfullyAndReturnJwt() throws Exception {
        String username = "login_user_" + UUID.randomUUID().toString().substring(0, 8);
        String plainPassword = "Password123!";
        userRepository.saveAndFlush(new User(username, username + "@test.com", passwordEncoder.encode(plainPassword), "USER"));

        LoginRequest request = new LoginRequest(username, plainPassword);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.expiresIn", is(3600)));
    }

    @Test
    @DisplayName("7. Reject login with wrong password - 401 Unauthorized")
    void shouldRejectLoginWithWrongPassword() throws Exception {
        String username = "wrong_pwd_user_" + UUID.randomUUID().toString().substring(0, 8);
        userRepository.saveAndFlush(new User(username, username + "@test.com", passwordEncoder.encode("CorrectPassword"), "USER"));

        LoginRequest request = new LoginRequest(username, "WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid username or password")));
    }

    @Test
    @DisplayName("8. Reject login with unknown username - 401 Unauthorized")
    void shouldRejectLoginWithUnknownUsername() throws Exception {
        LoginRequest request = new LoginRequest("non_existent_user_999", "SomePassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.message", is("Invalid username or password")));
    }

    @Test
    @DisplayName("9. Reject GET /api/employees without JWT - 401 Unauthorized")
    void shouldRejectGetEmployeesWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/employees"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("10. Reject GET /api/departments without JWT - 401 Unauthorized")
    void shouldRejectGetDepartmentsWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("11. Valid JWT allows access to employee API - 200 OK")
    void shouldAllowAccessToEmployeesWithValidJwt() throws Exception {
        String username = "jwt_emp_user_" + UUID.randomUUID().toString().substring(0, 8);
        userRepository.saveAndFlush(new User(username, username + "@test.com", passwordEncoder.encode("pass123"), "USER"));
        String token = jwtService.generateToken(username, 3600000);

        mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("12. Valid JWT allows access to department API - 200 OK")
    void shouldAllowAccessToDepartmentsWithValidJwt() throws Exception {
        String username = "jwt_dept_user_" + UUID.randomUUID().toString().substring(0, 8);
        userRepository.saveAndFlush(new User(username, username + "@test.com", passwordEncoder.encode("pass123"), "USER"));
        String token = jwtService.generateToken(username, 3600000);

        mockMvc.perform(get("/api/departments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("13. Invalid JWT does not grant access - 401 Unauthorized")
    void shouldRejectInvalidJwtToken() throws Exception {
        mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer invalid.jwt.token.string"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("14. Expired JWT does not grant access - 401 Unauthorized")
    void shouldRejectExpiredJwtToken() throws Exception {
        String username = "expired_user_" + UUID.randomUUID().toString().substring(0, 8);
        userRepository.saveAndFlush(new User(username, username + "@test.com", passwordEncoder.encode("pass123"), "USER"));
        // Generate a token that expired 10 seconds ago (-10000 ms)
        String expiredToken = jwtService.generateToken(username, -10000);

        mockMvc.perform(get("/api/employees")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("15. Public endpoint: GET /api/health works without JWT - 200 OK")
    void shouldAllowHealthEndpointWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));
    }

    @Test
    @DisplayName("16. Public endpoint: POST /api/auth/register works without JWT")
    void shouldAllowRegisterEndpointWithoutJwt() throws Exception {
        String username = "public_reg_" + UUID.randomUUID().toString().substring(0, 8);
        RegisterRequest request = new RegisterRequest(username, username + "@test.com", "Password123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("17. Public endpoint: POST /api/auth/login works without JWT")
    void shouldAllowLoginEndpointWithoutJwt() throws Exception {
        String username = "public_login_" + UUID.randomUUID().toString().substring(0, 8);
        userRepository.saveAndFlush(new User(username, username + "@test.com", passwordEncoder.encode("Password123!"), "USER"));

        LoginRequest request = new LoginRequest(username, "Password123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()));
    }
}
