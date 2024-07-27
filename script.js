let page = 1;
let fetching = false;

const container = document.getElementById("container");
const cols = Array.from(container.getElementsByClassName("col"));
const batchSize = 500;
const fetchImageData = async () => {
  if (fetching) return;
  fetching = true;
  document.getElementById("loader").style.display = "block";

  try {
    const responses = await Promise.all(
      Array.from({ length: batchSize }, (_, i) =>
        fetch(`https://api.waifu.pics/sfw/waifu?page=${page}&batch=${i}`)
      )
    );
    const datas = await Promise.all(
      responses.map((response) => response.json())
    );
    document.getElementById("loader").style.display = "none";
    fetching = false;
    page += 1;

    return datas.filter((data) => data && data.url).map((data) => data.url);
  } catch (error) {
    console.error("Error fetching data:", error);
    fetching = false;
    document.getElementById("loader").style.display = "none";
    return [];
  }
};

const createCard = (image, col) => {
  const card = document.createElement("div");
  card.classList.add("card");
  const img = document.createElement("img");
  img.src = image;
  img.alt = "Random Image";
  img.style.width = "100%";
  img.onerror = function () {
    this.parentElement.style.display = "none";
  };
  card.appendChild(img);
  col.appendChild(card);
};

const handleScroll = () => {
  if (fetching || cols.length === 0) return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.documentElement.scrollHeight;

  if (bodyHeight - scrollTop - windowHeight < 100) {
    fetchImageData()
      .then((images) => {
        images.forEach((image, index) => {
          createCard(image, cols[index % cols.length]);
        });
      })
      .catch((error) => {
        console.error("Error handling scroll:", error);
      });
  }
};

window.addEventListener("scroll", handleScroll);

fetchImageData()
  .then((images) => {
    images.forEach((image, index) => {
      createCard(image, cols[index % cols.length]);
    });
  })
  .catch((error) => {
    console.error("Error during initial fetch:", error);
  });
