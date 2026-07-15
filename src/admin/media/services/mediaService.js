const API = "http://localhost:5000/api/media";

export const mediaService = {

  async getAll() {

    const response = await fetch(API);

    return response.json();

  },

  async upload(formData) {

    const response = await fetch(API, {
      method: "POST",
      body: formData,
    });

    return response.json();

  },

  async delete(id) {

    const response = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    return response.json();

  },

};