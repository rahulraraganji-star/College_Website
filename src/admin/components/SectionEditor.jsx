import HeroEditor from "../editors/HeroEditor";
import TextEditor from "../editors/TextEditor";
import CollectionEditor from "../editors/CollectionEditor";
import GalleryEditor from "../editors/GalleryEditor";
import FacultyGridEditor from "../editors/FacultyGridEditor";
import TableEditor from "../editors/TableEditor";
import EmbedEditor from "../editors/EmbedEditor";

const SectionEditor = (props) => {

  switch (props.section.type) {

    case "hero":
      return <HeroEditor {...props} />;

    case "heading":
      return (
        <TextEditor
          {...props}
          mode="heading"
        />
      );

    case "richText":
      return (
        <TextEditor
          {...props}
          mode="richText"
        />
      );

    case "list":
      return (
        <CollectionEditor
          {...props}
          type="list"
        />
      );

    case "timeline":
      return (
        <CollectionEditor
          {...props}
          type="timeline"
        />
      );

    case "documentList":
      return (
        <CollectionEditor
          {...props}
          type="documentList"
        />
      );

    case "eventList":
      return (
        <CollectionEditor
          {...props}
          type="eventList"
        />
      );

    case "gallery":
      return <GalleryEditor {...props} />;

    case "faculty-grid":
      return (
        <FacultyGridEditor
          {...props}
        />
      );

    case "table":
      return <TableEditor {...props} />;

    case "embed":
      return <EmbedEditor {...props} />;

    default:
      return null;

  }

};

export default SectionEditor;