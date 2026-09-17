<script setup>
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/init'
import BookList from '@/components/BookList.vue'

const isbn = ref('')
const name = ref('')
const message = ref(null)
const errorMessage = ref(null)
const bookList = ref(null)

const addBook = async () => {
  message.value = null
  errorMessage.value = null

  const isbnNumber = Number(isbn.value)
  if (!Number.isInteger(isbnNumber)) {
    errorMessage.value = 'ISBN must be a valid number'
    return
  }

  try {
    await addDoc(collection(db, 'books'), {
      isbn: isbnNumber,
      name: name.value
    })
    message.value = `Book "${name.value}" added successfully!`
    isbn.value = ''
    name.value = ''
    // Refresh the list below so the new book shows up straight away
    bookList.value?.fetchBooks()
  } catch (error) {
    console.error('Error adding book:', error)
    errorMessage.value = error.message
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-6 offset-md-3">
        <h1 class="text-center">Add Book</h1>

        <form @submit.prevent="addBook">
          <div class="mb-3">
            <label for="isbn" class="form-label">ISBN</label>
            <input type="number" class="form-control" id="isbn" v-model="isbn" required />
          </div>

          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" id="name" v-model="name" required />
          </div>

          <div v-if="message" class="alert alert-success" role="alert">{{ message }}</div>
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary">Add Book</button>
          </div>
        </form>
      </div>
    </div>

    <BookList ref="bookList" />
  </div>
</template>
