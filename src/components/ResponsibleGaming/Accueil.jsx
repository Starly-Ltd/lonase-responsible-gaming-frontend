import { Link } from "react-router-dom";
import heroImage from "../../assets/images/responsible_gaming_hero.jpg";

export default function Accueil() {

  const faqItems = [
    {
      question: "De quels documents ai-je besoin pour effectuer ma demande ?",
      answer: "Vous aurez seulement besoin d'une copie lisible d'une pièce d'identité en cours de validité.",
    },
    {
      question: "Est-il obligatoire de réaliser le selfie dynamique pour demander mon interdiction de jeux ?",
      answer: "Pour réaliser votre demande d'interdiction de jeux en ligne, il est en effet obligatoire de valider votre identité grâce au selfie dynamique. C'est une étape simple et rapide qui vous permettra de gagner du temps. Grâce à la validation immédiate de votre identité vous pourrez être interdit de jeu en quelques jours seulement. Si vous ne souhaitez pas réaliser cette action, vous devrez alors demander votre interdiction de jeux par voie postale (la procédure sera néanmoins plus longue puisqu'elle nécessite l'envoi d'un courrier recommandé).",
    },
    {
      question: "Puis-je effectuer une demande pour l'un de mes proches ?",
      answer: "La demande d'interdiction volontaire de jeux est une démarche strictement personnelle. Elle ne peut être effectuée que par la personne concernée sauf si vous justifiez être son tuteur.",
    },
    {
      question: "J'ai effectué une demande d'interdiction et j'ai commis une erreur lors de la saisie de mes informations",
      answer: "Vous pouvez nous contacter en utilisant le formulaire de contact présent sur notre site.",
    },
    {
      question: "Où puis-je trouver de l'aide concernant ma pratique de jeu ?",
      answer: "Nous vous invitons à consulter le site Evalujeu.fr qui recense tous les dispositifs d'aide disponibles.",
    },
  ];

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <div className="bg-grey-bg">
        <div className="grid gap-6 px-4 py-16 max-w-[1200px] mx-auto lg:grid-cols-12">
          <h1 className="max-w-[791px] text-3xl lg:text-4xl font-bold text-gray-900 lg:col-span-11">
            Vous pensez avoir un problème avec le jeu ?
          </h1>
          <div className="text-lg lg:col-span-6">
            <p>
              Vous rencontrez des difficultés avec le jeu (addiction, endettement…) et vous souhaitez arrêter le jeu ? Vous avez la possibilité de <strong>vous protéger</strong> en demandant votre <strong>interdiction volontaire de jeux</strong> auprès de nos services.
              <br />
              <br />
              Cette démarche est strictement confidentielle et personnelle.
            </p>
          </div>
          <div className="bg-orange-secondary flex flex-col gap-y-4 p-4 border-0 border-l-2 border-l-orange-primary order-last lg:order-none lg:col-span-6">
            <div className="text-lg">
              <p>L'interdiction a pour conséquence de vous interdire :</p>
            </div>
            <ul className="flex flex-col gap-4 list-none">
              <li className="flex gap-2 items-baseline">
                <svg className="h-3 w-3 flex-shrink-0 mt-1" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 1H12" stroke="#172B74" strokeWidth="2"/>
                </svg>
                <p className="flex-1">d'entrer dans un casino ou un club de jeux</p>
              </li>
              <li className="flex gap-2 items-baseline">
                <svg className="h-3 w-3 flex-shrink-0 mt-1" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 1H12" stroke="#172B74" strokeWidth="2"/>
                </svg>
                <p className="flex-1">d'accéder à un site de jeux en ligne agréé par l'ANJ (paris sportifs, paris hippiques et poker)</p>
              </li>
              <li className="flex gap-2 items-baseline">
                <svg className="h-3 w-3 flex-shrink-0 mt-1" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 1H12" stroke="#172B74" strokeWidth="2"/>
                </svg>
                <p className="flex-1">d'accéder aux jeux de la FDJ et du PMU réalisés avec un compte joueur</p>
              </li>
            </ul>
            <div className="text-lg">
              <p>Cette inscription est valable pour une durée de trois ans minimum.</p>
              <p>Après cette durée, vous pouvez demander la levée de cette interdiction.</p>
            </div>
          </div>
          
          {/* Hero Image */}
          <picture className="lg:col-start-7 lg:col-span-5 lg:row-start-2 lg:row-span-2 w-full">
            <img 
              src={heroImage} 
              alt="Responsible Gaming Hero" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </picture>
        </div>
      </div>

      {/* Action Cards Section */}
      <div className="bg-gradient-to-b from-grey-bg to-white py-16">
        <div className="grid gap-6 px-4 justify-center lg:flex lg:justify-center lg:gap-8">
          <Link
            to="/set-limits"
            className="no-underline text-black bg-white border border-solid border-blue-primary rounded-lg p-6 flex flex-col gap-8 max-w-[342px] lg:max-w-[483px] shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="grid gap-2">
              <h2 className="text-2xl font-bold">Demander à être interdit</h2>
              <p className="text-base">
                Vous pouvez effectuer votre demande d'interdiction sur le service en ligne mis en place par l'ANJ en cliquant ici.
              </p>
            </div>
            <div className="m-auto">
              <div className="w-48 h-32 bg-orange-secondary rounded flex items-center justify-center">
                <span className="text-orange-primary text-4xl">📋</span>
              </div>
            </div>
          </Link>
          <Link
            to="/my-limits"
            className="no-underline text-black bg-white border border-solid border-blue-primary rounded-lg p-6 flex flex-col gap-8 max-w-[342px] lg:max-w-[483px] shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="grid gap-2">
              <h2 className="text-2xl font-bold">Lever une interdiction</h2>
              <p className="text-base">
                Au bout du délai de trois ans, si vous estimez ne plus avoir besoin de cette mesure, vous pouvez faire une demande de levée d'interdiction.
              </p>
            </div>
            <div className="m-auto">
              <div className="w-48 h-32 bg-orange-secondary rounded flex items-center justify-center">
                <span className="text-orange-primary text-4xl">🔓</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-grey-bg">
        <div id="faq" className="grid gap-6 px-4 py-16 max-w-[588px] mx-auto lg:justify-items-center">
          <h2 className="text-3xl font-bold text-gray-900">Questions fréquentes</h2>

          <div className="grid gap-2 w-full">
            {faqItems.map((item, index) => (
              <details
                key={index}
                className="bg-white grid px-8 border border-grey-border text-lg"
              >
                <summary className="flex py-6 gap-6 items-center justify-between cursor-pointer">
                  {item.question}
                  <svg
                    className="h-4 w-4 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="grid py-6">
                  <div className="bg-grey-bg p-4">{item.answer}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
