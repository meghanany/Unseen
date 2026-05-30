const WARDROBE_KEY = 'unseen_wardrobe'

export const saveToWardrobe = (entry) => {
  const wardrobe = getWardrobe()
  const newEntry = {
    ...entry,
    id: Date.now().toString(),
    savedAt: new Date().toISOString()
  }
  const updated = [newEntry, ...wardrobe]
  try {
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(updated))
  } catch (e) {
    // localStorage full — remove oldest
    const trimmed = updated.slice(0, 20)
    localStorage.setItem(WARDROBE_KEY, JSON.stringify(trimmed))
  }
  return newEntry
}

export const getWardrobe = () => {
  try {
    const data = localStorage.getItem(WARDROBE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const removeFromWardrobe = (id) => {
  const wardrobe = getWardrobe()
  const updated = wardrobe.filter(item => item.id !== id)
  localStorage.setItem(WARDROBE_KEY, JSON.stringify(updated))
}

export const clearWardrobe = () => {
  localStorage.removeItem(WARDROBE_KEY)
}
