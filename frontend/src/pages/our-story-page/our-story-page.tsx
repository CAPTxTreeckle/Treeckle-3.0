import { Image, List } from "semantic-ui-react";

import treecklePoster from "../../assets/treeckle-poster-min.jpg";
import treeckleLogo from "../../assets/treeckle-title-side-transparent.png";
import StandalonePageLayoutContainer from "../../components/standalone-page-layout-container";
import Timeline, { TimelineElement } from "../../components/timeline";
import VideoPlayer from "../../components/video-player";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";

const milestones: TimelineElement[] = [
  {
    meta: "July 2021: Completed Treeckle 3.0 development",
  },
  {
    content: (
      <div>
        <h3>Developer</h3>

        <List bulleted>
          <List.Item>Tan Kai Qun, Jeremy</List.Item>
        </List>

        <h3>New features</h3>

        <List bulleted>
          <List.Item>Improve facility booking UI/UX</List.Item>
          <List.Item>New facility booking table & calendar</List.Item>
          <List.Item>Add google/facebook login</List.Item>
        </List>
      </div>
    ),
    meta: "May 2021: Started development for Treeckle 3.0",
  },
  {
    content: (
      <div>
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="/treeckle_2.0_td.pdf"
        >
          Technical document
        </a>
      </div>
    ),
    meta: "Nov 2020: Completed Treeckle 2.0 development",
  },
  {
    content: (
      <div>
        <h3>Developers</h3>

        <List bulleted>
          <List.Item>Tan Kai Qun, Jeremy</List.Item>
          <List.Item>Hong Shao Yi</List.Item>
          <List.Item>Ng Yi Long Kester</List.Item>
          <List.Item>Ooi Ming Sheng</List.Item>
        </List>
      </div>
    ),
    meta: "Sep 2020: Started development for Treeckle 2.0",
  },
  {
    content: (
      <div>
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="/treeckle_2.0_proposal.pdf"
        >
          Proposal document
        </a>
      </div>
    ),
    meta: "Aug 2019: Proposal for Treeckle 2.0 as part of the CS3219 module project",
  },
  {
    meta: "Dec 2019: Handed over Treeckle project to CAPT",
  },
  {
    content: <Image src={treecklePoster} bordered rounded />,
    meta: "Nov 2019: Participated and won 4th place in 15th STePS (SoC Term Project Showcase)",
  },
  {
    content: <VideoPlayer video="https://www.youtube.com/embed/TeCNkYFiCh4" />,
    meta: "Nov 2019: Completed development",
  },
  {
    content: <Image src={treeckleLogo} alt="Treeckle" />,
    meta: "Oct 2019: Started development",
  },
];

function OurStoryPage() {
  useScrollToTop();

  return (
    <StandalonePageLayoutContainer>
      <h1>Our Story</h1>

      <p>
        Treeckle is a student-initiated project started in 2019 as part of the{" "}
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://www.cs3216.com/"
        >
          CS3216
        </a>{" "}
        coursework project. It is built with the aim of being a one-stop student
        life platform for the Residential Colleges of NUS.
      </p>

      <p>
        Over the years, Treeckle has continously improved and evolved based on
        the feedback given by its users. If you would like to see a new feature
        or would like to contribute to the project, do contact us at{" "}
        <a href="mailto:treeckle@googlegroups.com" rel="noopener noreferrer">
          treeckle@googlegroups.com
        </a>
        . We are always open to suggestions and contributions :D
      </p>

      <h2>Co-Founders</h2>

      <List bulleted>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://jermytan.com/"
          >
            Tan Kai Qun, Jeremy
          </a>{" "}
          - Computer Science, NUS Computing
        </List.Item>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://subbash.com/"
          >
            Sree Subbash
          </a>{" "}
          - Computer Science, NUS Computing
        </List.Item>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.rssujay.com/"
          >
            Sujay R Subramanian
          </a>{" "}
          - Computer Engineering, NUS Computing & Engineering
        </List.Item>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/rohan-arya-varma-65358b112/"
          >
            Rohan Arya Varma
          </a>{" "}
          - Computer Engineering, NUS Computing & Engineering
        </List.Item>
      </List>

      <h2>Contributors</h2>

      <List bulleted>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://hongshaoyi.me/"
          >
            Hong Shao Yi
          </a>{" "}
          - Computer Science, NUS Computing (2020)
        </List.Item>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/kester-ng"
          >
            Ng Yi Long Kester
          </a>{" "}
          - Computer Science, NUS Computing (2020)
        </List.Item>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/ooimingsheng"
          >
            Ooi Ming Sheng
          </a>{" "}
          - Computer Science, NUS Computing (2020)
        </List.Item>
        <List.Item>
          <a
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/jloh02"
          >
            Jonathan Loh
          </a>{" "}
          - Computer Science, NUS Computing (2023 - 2024)
        </List.Item>
      </List>

      <h2>Milestones</h2>

      <Timeline elements={milestones} />
    </StandalonePageLayoutContainer>
  );
}

export default OurStoryPage;
