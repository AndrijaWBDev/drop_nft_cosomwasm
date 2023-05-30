import Head from "next/head";
import { Product, Dependency, WalletSection } from "../components";
import Link from "next/link";
import Image from "next/image";
import Modal from "react-modal";
import { useState, useEffect } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import ReactLoading from "react-loading";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import { storefront } from "../utils/storefront";
import productHelper from "../utils/productHelper";
import { useSigningClient } from "../contexts/cosmwasm";
import { numberWithCommas } from "../utils/utils";
import styles from "../styles/layout.module.scss";

Modal.setAppElement("#__next");

const PUBLIC_DENOM = process.env.NEXT_PUBLIC_DENOM;
const steps = [
  {
    label: "Burn $SHIRT",
    description:
      "Burning your $SHIRT tokens, please wait for the transaction to confirm.",
  },
  {
    label: "Claim NFT",
    description: "Claim an NFT representing the physical shirt you are buying.",
  },
  {
    label: "Finalize Order",
    description: "Proceed to Shopify to finalize your order.",
  },
];

export default function Redeem() {
  const chainName = process.env.NEXT_PUBLIC_CHAIN ?? "stargaze";
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [shirt, setShirt] = useState(null);
  const { balances }: any = useSigningClient();
  const [size, setSize] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getShirt = async () => {
    const { body } = await storefront();
    const mappedProducts = body
      ? (body as any).products.edges.map((p) => {
          return productHelper.map(p.node);
        })
      : [];
    const sku = "shirtdrop";
    const shirt = productHelper.getBySKU(sku, mappedProducts);
    setShirt(shirt[0]);
  };

  useEffect(() => {
    getShirt();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-10 min-h-[100vh]">
      <Head>
        <title>Suitdrop | Redeem</title>
        <meta name="description" content="Generated by create cosmos app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="flex flex-row justify-end items-center mb-2 gap-5">
        <Link
          className="inline-flex items-center justify-center w-12 h-12 text-black border rounded-lg dark:text-white hover:bg-black/10 dark:hover:bg-white/10 border-black/10 dark:border-white/10 mr-2"
          href="/"
        >
          <div className="hover:underline hover:underline-offset-1 text-[#e0e0e0] hover:text-white mr-2 text-lg cursor-pointer">
            Claim Airdrop
          </div>
        </Link>
        <WalletSection />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl md:text-3xl">
          <Image src="/shirtdrop.svg" width={230} height={62} />
        </h1>
      </div>

      <div className="container flex flex-col md:flex-row w-full mt-10 mx-auto">
        <div className="w-full md:w-1/2 flex justify-center text-center">
          {shirt ? (
            <Image
              src={shirt.image.src}
              height={shirt.image.height}
              width={shirt.image.width}
              alt={shirt.title}
            />
          ) : (
            <div className="flex flex-col gap-4 justify-center items-center h-full min-h-[500px]">
              <ReactLoading type="spin" color="#fff" />
              <span className="text-white text-lg">Loading...</span>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-evenly">
          <div className="flex w-full text-center justify-center text-2xl">
            SELECT SIZE:
          </div>
          <div className="mt-5 flex w-full text-center text-2xl text-gray-400 justify-evenly">
            {shirt?.options.map((o) => {
              return (
                <div key={o.name} className={styles.option}>
                  {o.values.map((v) => {
                    return (
                      <button
                        key={v}
                        className={size === v ? "!bg-[#790414]" : ""}
                        onClick={() => setSize(v)}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex w-full text-center justify-center text-2xl">
            DESCRIPTION
          </div>
          <div
            className="mt-5 flex flex-col w-full text-center justify-center text-lg"
            dangerouslySetInnerHTML={{ __html: shirt?.description }}
          ></div>

          <div className="container flex flex-col w-full mt-10 mb-5">
            <a href="https://osmosis.zone/" target="_blank" rel="noreferrer">
              <button className="w-full bg-[#e00036] hover:bg-[#ad062e] transition py-2.5 rounded-md text-xl">
                BUY $SHIRT
              </button>
            </a>
            <button
              className="mt-5 w-full bg-gray-500 hover:bg-gray-600 transition p-2.5 rounded-md text-xl"
              onClick={() => {
                if (!size) {
                  toast.warn("Please select the size.");
                  return;
                }
                setModalIsOpen(true);
              }}
              disabled={!shirt}
            >
              REDEEM
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center  text-sm text-center bg-black min-h-[200px] "></div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Redeem Modal"
        overlayClassName="bg-gray-500 bg-opacity-75 transition-opacity opacity-100"
        className="bg-gray-800 flex flex-col justify-center items-center rounded-2xl relative p-10"
      >
        <h2 className="top-10 text-2xl text-white text-bold mb-5">REDEEM</h2>
        <button
          className="absolute right-5 top-5 text-md text-white text-bold"
          onClick={() => setModalIsOpen(false)}
        >
          <AiOutlineCloseCircle className="w-8 h-8" />
        </button>
        <div className="flex w-full">
          <div className="w-[200px]">
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </div>
          <div className="w-[300px] flex flex-col gap-3">
            <Typography variant="h6" className="text-white">
              {steps[activeStep]?.label}
            </Typography>
            <Typography className="text-white">
              {steps[activeStep]?.description}
            </Typography>
            <div className="flex gap-2">
              <Button
                disabled={activeStep === 0}
                className={`!bg-gray-600 !text-white !w-full ${activeStep === 0 ? '!text-gray-400' : ''}`}
                variant="contained"
                onClick={handleBack}
                sx={{ mt: 1, mr: 1 }}
              >
                Back
              </Button>
              <Button
                disabled={activeStep >= steps.length}
                variant="contained"
                className={`!bg-[#e00036] !text-white !w-full ${activeStep >= steps.length ? '!text-gray-400' : ''}`}
                onClick={handleNext}
                sx={{ mt: 1, mr: 1 }}
              >
                {activeStep === steps.length - 1 ? "Finish" : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
