<script setup>
import { ref, onMounted } from 'vue'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/firebase/init'

const books = ref([])
const loading = ref(false)
const errorMessage = ref(null)

// Query options (Task 8.2): where isbn > minIsbn, orderBy isbn, limit results.
// Ordering is on the same field as the inequality filter, so no composite
// index is needed in Firestore.
const minIsbn = ref(1000)
const sortDirection = ref('asc')
const maxResults = ref(10)

// Inline edit state (Task 8.2)
const editingId = ref(null)
const editIsbn = ref('')
const editName = ref('')

const fetchBooks = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    const q = query(
      collection(db, 'books'),
      where('isbn', '>', Number(minIsbn.value)),
      orderBy('isbn', sortDirection.value),
      limit(Number(maxResults.value))
    )
    const snapshot = await getDocs(q)
    books.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error fetching books:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

const startEdit = (book) => {
  editingId.value = book.id
  editIsbn.value = book.isbn
  editName.value = book.name
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id) => {
  const isbnNumber = Number(editIsbn.value)
  if (!Number.isInteger(isbnNumber) || !editName.value.trim()) {
    errorMessage.value = 'ISBN must be a number and name cannot be empty'
    return
  }
  try {
    await updateDoc(doc(db, 'books', id), { isbn: isbnNumber, name: editName.value })
    editingId.value = null
    await fetchBooks()
  } catch (error) {
    console.error('Error updating book:', error)
    errorMessage.value = error.message
  }
}

const removeBook = async (book) => {
  if (!confirm(`Delete "${book.name}"?`)) return
  try {
    await deleteDoc(doc(db, 'books', book.id))
    await fetchBooks()
  } catch (error) {
    console.error('Error deleting book:', error)
    errorMessage.value = error.message
  }
}

onMounted(fetchBooks)

// Lets AddBookView refresh the list after a new book is added
defineExpose({ fetchBooks })
</script>

<template>
  <div class="mt-5">
    <h2 class="text-center">Book List</h2>

    <form class="row g-2 align-items-end mb-3" @submit.prevent="fetchBooks">
      <div class="col-md-4">
        <label for="minIsbn" class="form-label">where ISBN &gt;</label>
        <input type="number" class="form-control" id="minIsbn" v-model="minIsbn" required />
      </div>
      <div class="col-md-3">
        <label for="sortDirection" class="form-label">orderBy ISBN</label>
        <select class="form-select" id="sortDirection" v-model="sortDirection">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="maxResults" class="form-label">limit</label>
        <input
          type="number"
          class="form-control"
          id="maxResults"
          v-model="maxResults"
          min="1"
          required
        />
      </div>
      <div class="col-md-2">
        <button type="submit" class="btn btn-secondary w-100">Search</button>
      </div>
    </form>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">{{ errorMessage }}</div>

    <p v-if="loading">Loading...</p>
    <p v-else-if="books.length === 0">No books found.</p>

    <table v-else class="table table-striped align-middle">
      <thead>
        <tr>
          <th>ISBN</th>
          <th>Name</th>
          <th class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="book in books" :key="book.id">
          <template v-if="editingId === book.id">
            <td><input type="number" class="form-control" v-model="editIsbn" /></td>
            <td><input type="text" class="form-control" v-model="editName" /></td>
            <td class="text-end">
              <button class="btn btn-sm btn-success me-2" @click="saveEdit(book.id)">Save</button>
              <button class="btn btn-sm btn-outline-secondary" @click="cancelEdit">Cancel</button>
            </td>
          </template>
          <template v-else>
            <td>{{ book.isbn }}</td>
            <td>{{ book.name }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-warning me-2" @click="startEdit(book)">Edit</button>
              <button class="btn btn-sm btn-danger" @click="removeBook(book)">Delete</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
