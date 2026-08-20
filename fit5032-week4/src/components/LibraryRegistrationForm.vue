<template>
  <div>
    <div class="container mt-5">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <h1 class="text-center">User Information Form</h1>
                <form @submit.prevent="submitForm">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="username" class="form-label">Username</label>
                            <input type="text" class="form-control" id="username"
                                @blur="() => validateName(true)"
                                @input="() => validateName(false)"
                                v-model="formData.username" />
                                <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
                        </div>
                        <div class="col-md-6">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password"
                                @blur="() => validatePassword(true)"
                                @input="() => validatePassword(false)"
                                v-model="formData.password">
                            <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input"
                                    id="isAustralian"
                                    @change="() => validateResident(true)"
                                    v-model="formData.isAustralian">
                                <label class="form-check-label" for="isAustralian">Australian Resident?</label>
                            </div>
                            <div v-if="errors.resident" class="text-danger">{{ errors.resident }}</div>
                        </div>
                        <div class="col-md-6">
                            <label for="gender" class="form-label">Gender</label>
                            <select class="form-select" id="gender"
                                @blur="() => validateGender(true)"
                                @input="() => validateGender(false)"
                                v-model="formData.gender">
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="reason" class="form-label">Reason for joining</label>
                        <textarea class="form-control" id="reason" rows="3"
                            @blur="() => validateReason(true)"
                            @input="() => validateReason(false)"
                            v-model="formData.reason"></textarea>
                        <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary me-2">Submit</button>
                        <button type="button" class="btn btn-secondary"
                            @click="clearForm">Clear</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="container mt-5" v-if="submittedCards.length">
        <div class="row">
            <div class="col-md-8 offset-md-2">
                <DataTable :value="submittedCards" tableStyle="min-width: 30rem">
                    <Column field="username" header="Username"></Column>
                    <Column field="password" header="Password"></Column>
                    <Column header="Australian Resident">
                        <template #body="slotProps">
                            {{ slotProps.data.isAustralian ? 'Yes' : 'No' }}
                        </template>
                    </Column>
                    <Column field="gender" header="Gender"></Column>
                    <Column field="reason" header="Reason"></Column>
                </DataTable>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
  
const formData = ref({
    username: '',
    password: '',
    isAustralian: false,
    reason: '',
    gender: ''
});

const submittedCards = ref([]);

const submitForm = () => {
    validateName(true);
    validatePassword(true);
    validateResident(true);
    validateGender(true);
    validateReason(true);
    if (!errors.value.username && !errors.value.password && !errors.value.resident && !errors.value.gender && !errors.value.reason) {
        submittedCards.value.push({...formData.value});
        clearForm();
    }
};

const clearForm = () => {
    formData.value = {
        username: '',
        password: '',
        isAustralian: false,
        reason: '',
        gender: ''
    };
};

const errors = ref({
    username: null,
    password: null,
    resident: null,
    gender: null,
    reason: null,
});

const validateName = (blur) => {
    if (formData.value.username.length < 3) {
        if (blur) errors.value.username = 'Name must be at least 3 characters';
    } else {
        errors.value.username = null;
    }
};

const validatePassword = (blur) => {
    const password = formData.value.password;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        if (blur) errors.value.password = `Password must be at least ${minLength} characters long.`;
    } else if (!hasUpperCase) {
        if (blur) errors.value.password = 'Password must contain at least one uppercase letter.';
    } else if (!hasLowerCase) {
        if (blur) errors.value.password = 'Password must contain at least one lowercase letter.';
    } else if (!hasNumber) {
        if (blur) errors.value.password = 'Password must contain at least one number.';
    } else if (!hasSpecialChar) {
        if (blur) errors.value.password = 'Password must contain at least one special character.';
    } else {
        errors.value.password = null;
    }
};

const validateResident = (blur) => {
    if (!formData.value.isAustralian) {
        if (blur) errors.value.resident = 'You must be an Australian resident to join.';
    } else {
        errors.value.resident = null;
    }
};

const validateGender = (blur) => {
    if (!formData.value.gender) {
        if (blur) errors.value.gender = 'Please select a gender.';
    } else {
        errors.value.gender = null;
    }
};

const validateReason = (blur) => {
    const reason = formData.value.reason.trim();
    if (!reason) {
        if (blur) errors.value.reason = 'Reason cannot be empty.';
    } else {
        errors.value.reason = null;
    }
};
</script>

