import { createClient } from "contentful";
import Image from "next/image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Skeleton from "../../components/Skeleton";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});

export const getStaticPaths = async () => {
  const res = await client.getEntries({
    content_type: "recipe",
  });

  const paths = res.items.map((item) => {
    return {
      params: { slug: item.fields.slug },
    };
  });
  return {
    paths: paths,
    fallback: true,
  };
};

export async function getStaticProps({ params }) {
  //each run of getStaticPaths, next will run getStaticProps and within the context object for getStaticProps there is param for the slug
  const { items } = await client.getEntries({
    //destructuring the items within the res object. the items are the entries that we are getting from contentful
    content_type: "recipe",
    "fields.slug": params.slug,
  }); //tells contentful to only return where the contentful slug matches the slug inside the path that is currently being evaluated

  if (!items.length) {
    //if items array does not length then that means the recipe was not found
    return {
      redirect: {
        destination: "/",
        permenant: false,
      },
    };
  }

  return {
    props: { recipe: items[0] },
    revalidate: 1,
  };
}
export default function RecipeDetails({ recipe }) {
  if (!recipe) return <Skeleton />;
  const { featuredImage, title, cookingTime, ingredients, method } =
    recipe.fields;
  return (
    <div>
      <div className="banner">
        <Image
          src={`https:${featuredImage.fields.file.url}`}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
        />
        <h2>{title}</h2>
        <p>Takes about {cookingTime} mins to cook.</p>
        <h3>Ingredients:</h3>
        {ingredients.map((ing) => (
          <span key={ing}>{ing}</span>
        ))}

        <div className="method">
          <h3>Method:</h3>
          <div>{documentToReactComponents(method)}</div>
        </div>

        <style jsx>{`
          h2,
          h3 {
            text-transform: uppercase;
          }
          .banner h2 {
            margin: 0;
            background: #fff;
            display: inline-block;
            padding: 20px;
            position: relative;
            top: -60px;
            left: -10px;
            transform: rotateZ(-1deg);
            box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
          }
          .info p {
            margin: 0;
          }
          .info span::after {
            content: ", ";
          }
          .info span:last-child::after {
            content: ".";
          }
        `}</style>
      </div>
    </div>
  );
}
