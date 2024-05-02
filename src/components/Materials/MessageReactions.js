import { Box, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import EmojiDetailBox from "../MessageActionMenu/EmojiDetailBox/EmojiDetailBox";
import { isMobile } from "../../pages/Chatpage";

const MessageReactions = ({ m, hideEmojiDetailBoxs }) => {
  useEffect(() => {
    document.addEventListener("click", hideEmojiDetailBoxs);
    return () => document.removeEventListener("click", hideEmojiDetailBoxs);
    // eslint-disable-next-line
  }, []);

  const handleReactionsClick = (e) => {
    e.stopPropagation();
    let EmojiDetailBox = document.querySelector(`#EmojiDetailBox${m._id}`);
    if (EmojiDetailBox.classList.contains("active")) return;
    hideEmojiDetailBoxs(); // hides all the emoji detail box before showing the cliked one
    EmojiDetailBox.classList.add("active");

    function setEmojiDetailBoxPos(origOne, origTwo) {
      if (e.clientX > 800 || (isMobile() && e.clientX > 150)) {
        EmojiDetailBox.style.left = "-125px";
        EmojiDetailBox.style.transformOrigin = origOne;
      } else {
        EmojiDetailBox.style.transformOrigin = origTwo;
      }
    }

    if (e.clientY < 360) {
      EmojiDetailBox.style.bottom = "-13rem";
      setEmojiDetailBoxPos("top", "top left");
    } else {
      EmojiDetailBox.style.bottom = "2rem";
      setEmojiDetailBoxPos("bottom", "bottom left");
    }
  };

  return (
    <Box
      cursor={"pointer"}
      pos={"absolute"}
      _hover={{ bg: "#ebebec" }}
      bottom={"-1rem"}
      left={".2rem"}
      bg={"white"}
      padding={"0rem .2rem"}
      borderRadius={"2rem"}
      onClick={handleReactionsClick}
      transition={".2s all"}
      boxShadow={"0 0 0 .5px rgba(0,0,0,.6), inset 0 0 1px rgba(0,0,0,.2)"}
    >
      <Text fontSize={".9rem"} fontWeight={"normal"}>
        {m.reactions
          .map((rec) => rec.reaction)
          .slice(0, 2)
          .join("")}
        {m.reactions.map((rec) => rec.reaction).length > 2 && (
          <Text marginRight={".1rem"} display={"inline-block"}>
            +{m.reactions.map((rec) => rec.reaction).slice(2).length}
          </Text>
        )}
      </Text>
      <EmojiDetailBox m={m} />
    </Box>
  );
};

export default MessageReactions;
